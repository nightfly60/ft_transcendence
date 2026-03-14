import { Server, Socket } from 'socket.io';
import { buildGameState } from '../../game.js';
import { multiGames, drawOffers } from './state.js';
import { finalizeGame } from './db.js';

/**
 * @brief Enregistre les événements liés aux propositions de nulle.
 *
 * Gère trois événements :
 * - `propose_draw`  : un joueur propose la nulle à son adversaire.
 * - `accept_draw`   : l'adversaire accepte — la partie se termine nulle.
 * - `refuse_draw`   : l'adversaire refuse — la partie continue.
 *
 * @param io     Instance du serveur Socket.IO.
 * @param socket Socket du joueur.
 */
export function registerDraw(io: Server, socket: Socket): void {
  socket.on('propose_draw', ({ gameId }: { gameId: string }) => {
    const game = multiGames.get(gameId);
    if (!game || game.gameStatus !== 'playing' && game.gameStatus !== 'check') return;
    if (drawOffers.has(gameId)) return;
    drawOffers.set(gameId, socket.id);
    socket.to(gameId).emit('draw_proposed');
  });

  socket.on('accept_draw', async ({ gameId }: { gameId: string }) => {
    const game = multiGames.get(gameId);
    if (!game || !drawOffers.has(gameId)) return;
    drawOffers.delete(gameId);

    const drawn = { ...game, gameStatus: 'draw' as const };
    multiGames.set(gameId, drawn);
    io.to(gameId).emit('game_state', buildGameState(drawn));

    await finalizeGame(gameId, game.whiteUserId, game.blackUserId, game.moveHistory.length, null);
  });

  socket.on('refuse_draw', ({ gameId }: { gameId: string }) => {
    drawOffers.delete(gameId);
    socket.to(gameId).emit('draw_refused');
  });
}
