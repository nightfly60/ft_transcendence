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
export function registerResign(io, socket) {
    socket.on('multi_resign', async ({ gameId }) => {
        const game = multiGames.get(gameId);
        if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate' || game.gameStatus === 'draw' || game.gameStatus === 'resign')
            return;
        const resignColor = game.white === socket.id ? 'w' : 'b';
        const resigned = { ...game, turn: resignColor, gameStatus: 'resign' };
        multiGames.set(gameId, resigned);
        io.to(gameId).emit('game_state', buildGameState(resigned));
        const winnerSocketId = resignColor === 'w' ? game.black : game.white;
        const winnerUserId = io.sockets.sockets.get(winnerSocketId)?.data.userId;
        await finalizeGame(gameId, game.whiteUserId, game.blackUserId, game.moveHistory.length, winnerUserId);
    });
}
