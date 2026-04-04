import { Server, Socket } from 'socket.io';
import { ChessGame } from '../types.js';
import { makeGame, buildGameState, applyMoveToGame, parseAndValidate, toPromotionPiece } from '../game.js';

const soloGames = new Map<string, ChessGame>();
let soloGameCounter = 0;

export function registerSoloEvents(_io: Server, socket: Socket): void {

  socket.on('start_solo', () => {
    // console.log(`[solo] start_solo reçu userId=${socket.data.userId}`);
    const gameId = `solo_${++soloGameCounter}_${socket.id}`;
    // console.log(`[solo] game créée gameId=${gameId}`);
    const game = makeGame();
    soloGames.set(gameId, game);
    socket.join(gameId);
    socket.emit('solo_ready', { gameId });
    socket.emit('game_state', buildGameState(game));
    // console.log(`[solo] solo_ready + game_state envoyés gameId=${gameId}`);
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
