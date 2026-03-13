import { Server, Socket } from 'socket.io';
import { PieceColor } from '../../types.js';
import { buildGameState } from '../../game.js';
import { multiGames } from './state.js';
import { finalizeGame } from './db.js';

/**
 * @brief Enregistre l'événement `multi_resign`.
 *
 * Marque la partie comme abandonnée, notifie les joueurs
 * et clôture la partie en faveur de l'adversaire.
 *
 * @param io     Instance du serveur Socket.IO.
 * @param socket Socket du joueur qui abandonne.
 */
export function registerResign(io: Server, socket: Socket): void {
  socket.on('multi_resign', async ({ gameId }: { gameId: string }) => {
    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate' || game.gameStatus === 'draw' || game.gameStatus === 'resign') return;

    const resignColor: PieceColor = game.white === socket.id ? 'w' : 'b';
    const resigned = { ...game, turn: resignColor, gameStatus: 'resign' as const };
    multiGames.set(gameId, resigned);
    io.to(gameId).emit('game_state', buildGameState(resigned));
	
    const winnerSocketId = resignColor === 'w' ? game.black : game.white;
    const winnerUserId = io.sockets.sockets.get(winnerSocketId)?.data.userId as number;
    await finalizeGame(gameId, game.whiteUserId, game.blackUserId, game.moveHistory.length, winnerUserId);
  });
}
