import { buildGameState, applyMoveToGame, parseAndValidate, toPromotionPiece } from '../../game.js';
import { multiGames } from './state.js';
import { finalizeGame } from './db.js';
/**
 * @brief Enregistre l'événement `move`.
 *
 * Valide le coup, applique-le sur la partie et diffuse le nouvel état.
 * Si la partie se termine par échec et mat ou pat, clôture la partie via finalizeGame.
 *
 * @param io     Instance du serveur Socket.IO.
 * @param socket Socket du joueur.
 */
export function registerMove(io, socket) {
    socket.on('move', async ({ gameId, from, to, promotion }) => {
        const game = multiGames.get(gameId);
        if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate' || game.gameStatus === 'draw' || game.gameStatus === 'resign')
            return;
        const playerColor = game.white === socket.id ? 'w' : 'b';
        const coords = parseAndValidate(socket, game, from, to, playerColor);
        if (!coords)
            return;
        const updated = {
            ...applyMoveToGame(game, coords.fromR, coords.fromC, coords.toR, coords.toC, toPromotionPiece(promotion)),
            white: game.white,
            black: game.black,
            whiteUserId: game.whiteUserId,
            blackUserId: game.blackUserId,
        };
        multiGames.set(gameId, updated);
        io.to(gameId).emit('game_state', buildGameState(updated));
        if (updated.gameStatus === 'checkmate') {
            const winnerSocketId = playerColor === 'w' ? game.white : game.black;
            const winnerUserId = io.sockets.sockets.get(winnerSocketId)?.data.userId;
            await finalizeGame(gameId, updated.whiteUserId, updated.blackUserId, updated.moveHistory.length, winnerUserId);
        }
        else if (updated.gameStatus === 'stalemate') {
            await finalizeGame(gameId, updated.whiteUserId, updated.blackUserId, updated.moveHistory.length, null);
        }
    });
}
