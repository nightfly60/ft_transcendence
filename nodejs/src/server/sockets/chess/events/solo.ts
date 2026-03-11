import { Server, Socket } from 'socket.io';
import { ResultSetHeader } from 'mysql2';
import pool from '../../../db.js';
import { ChessGame } from '../types.js';
import { makeGame, buildGameState, applyMoveToGame, parseAndValidate, toPromotionPiece } from '../game.js';

const soloGames = new Map<string, ChessGame>();

export function registerSoloEvents(io: Server, socket: Socket): void {

  socket.on('start_solo', async () => {
    console.log(`[solo] start_solo reçu userId=${socket.data.userId}`);
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO Game (timestamp, id_player_one) VALUES (NOW(), ?)',
        [socket.data.userId]
      );
      const gameId = String(result.insertId);
      console.log(`[solo] game créée gameId=${gameId}`);
      const game = makeGame();
      soloGames.set(gameId, game);
      socket.join(gameId);
      socket.emit('solo_ready', { gameId });
      socket.emit('game_state', buildGameState(game));
      console.log(`[solo] solo_ready + game_state envoyés gameId=${gameId}`);
    } catch (err) {
      console.error('[solo] erreur start_solo:', err);
    }
  });

  socket.on('solo_move', ({
    gameId, from, to, promotion,
  }: { gameId: string; from: string; to: string; promotion?: string }) => {
    const game = soloGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') return;

    const coords = parseAndValidate(socket, game, from, to, null);
    if (!coords) return;

    const updated = applyMoveToGame(game, coords.fromR, coords.fromC, coords.toR, coords.toC, toPromotionPiece(promotion));
    soloGames.set(gameId, updated);
    socket.emit('game_state', buildGameState(updated));
  });

  socket.on('solo_resign', ({ gameId }: { gameId: string }) => {
    const game = soloGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') return;
    const resigned: ChessGame = { ...game, gameStatus: 'checkmate' };
    soloGames.set(gameId, resigned);
    socket.emit('game_state', buildGameState(resigned));
  });
}
