import { Server, Socket } from 'socket.io';
import { ResultSetHeader } from 'mysql2';
import pool from '../../../db.js';
import { ChessGame } from '../types.js';
import { makeGame, buildGameState, applyMoveToGame, parseAndValidate, toPromotionPiece } from '../game.js';
import { generateFEN } from '../fen.js';
import { SoloIAGame } from '../types.js';
import { getIAMove } from '../../../routes/ia.routes.js';	

const soloIAGames = new Map<string, SoloIAGame>();

export function registerSoloIAEvents(io: Server, socket: Socket): void {
	socket.on('start_solo_ia', async (data: {level?: string} = {}) => {
		const level = data.level ?? 'intermediaire';
		// console.log(`[soloIA] start_solo_ia reçu userId=${socket.data.userId}`);
		try {
		const [result] = await pool.query<ResultSetHeader>(
			'INSERT INTO Game (timestamp, id_player_one) VALUES (NOW(), ?)',
			[socket.data.userId]
		);
		const gameId = String(result.insertId);
		// console.log(`[soloIA] game créée gameId=${gameId}`);
		const game: SoloIAGame = { ...makeGame(), iaLevel: level };
		soloIAGames.set(gameId, game);
		socket.join(gameId);
		socket.emit('solo_ready', { gameId });
		socket.emit('game_state', buildGameState(game));
		} catch (err) {
		console.error('[soloIA] erreur start_solo_ia:', err);
		}
	});

	socket.on('solo_ia_move', async ({
		gameId, from, to, promotion,
	}: { gameId: string; from: string; to: string; promotion?: string }) => {

		const game = soloIAGames.get(gameId);
		if (!game || game.gameStatus !== 'playing') return;

		const coords = parseAndValidate(socket, game, from, to, null);
		if (!coords) return;

		const updated: SoloIAGame = {
			...applyMoveToGame(game, coords.fromR, coords.fromC, coords.toR, coords.toC, toPromotionPiece(promotion)),
			iaLevel: game.iaLevel
		};
		soloIAGames.set(gameId, updated);
		socket.emit('game_state', buildGameState(updated));

		if (updated.gameStatus !== 'playing') return;

		await playIAMove(gameId, updated, socket);
	});

	socket.on('solo_resign', ({ gameId }: { gameId: string }) => {
		const game = soloIAGames.get(gameId);
		if (!game || game.gameStatus !== 'playing') return;
		const resigned: SoloIAGame = { ...game, gameStatus: 'checkmate' };
		soloIAGames.set(gameId, resigned);
		socket.emit('game_state', buildGameState(resigned));
	});
}


async function playIAMove(gameId: string, game: SoloIAGame, socket: Socket) {
	await new Promise(r => setTimeout(r, 400));
	const fen = generateFEN(game);
	try {
		const move = await getIAMove(fen, game.iaLevel);
		const from = move.slice(0, 2);
		const to   = move.slice(2, 4);
		const coords = parseAndValidate(socket, game, from, to, null);
		if (!coords) return;
		const updated: SoloIAGame = {
		...applyMoveToGame(game, coords.fromR, coords.fromC, coords.toR, coords.toC, undefined),
		iaLevel: game.iaLevel
		};
		soloIAGames.set(gameId, updated);
		socket.emit('game_state', buildGameState(updated));
	} catch (err) {
		console.error('[soloIA] erreur playIAMove', err);
	}
}