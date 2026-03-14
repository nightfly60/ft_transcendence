import { Server, Socket } from 'socket.io';
import { PieceColor } from '../../types.js';
import { buildGameState } from '../../game.js';
import { DISCONNECT_TIMEOUT_MS, waitingPlayer, setWaitingPlayer, multiGames, disconnectTimers, disconnectTimerStarts } from './state.js';
import { finalizeGame } from './db.js';

/**
 * @brief Démarre un timer de forfait pour un joueur absent.
 *
 * Si le timer expire sans que le joueur soit revenu, la partie est
 * clôturée en faveur de l'adversaire. Le timer est annulé si le
 * joueur se reconnecte (géré dans matchmaking.ts → rejoinGame).
 *
 * @param io      Instance du serveur Socket.IO.
 * @param socket  Socket encore connecté (l'adversaire), utilisé pour notifier la room.
 * @param gameId  Identifiant de la partie.
 * @param userId  Id du joueur absent.
 */
export function startForfeitTimer(io: Server, socket: Socket, gameId: string, userId: number): void {
  const timerKey = `${gameId}:${userId}`;
  if (disconnectTimers.has(timerKey)) return;

  const timer = setTimeout(async () => {
    disconnectTimers.delete(timerKey);
    disconnectTimerStarts.delete(timerKey);
    const currentGame = multiGames.get(gameId);
    if (!currentGame || currentGame.gameStatus === 'checkmate' || currentGame.gameStatus === 'stalemate' || currentGame.gameStatus === 'draw' || currentGame.gameStatus === 'resign') return;

    const resignColor: PieceColor = userId === currentGame.whiteUserId ? 'w' : 'b';
    const forfeited = { ...currentGame, turn: resignColor, gameStatus: 'resign' as const };
    multiGames.set(gameId, forfeited);
    io.to(gameId).emit('game_state', buildGameState(forfeited));

    const winnerUserId = resignColor === 'w' ? currentGame.blackUserId : currentGame.whiteUserId;
    await finalizeGame(gameId, currentGame.whiteUserId, currentGame.blackUserId, currentGame.moveHistory.length, winnerUserId);
  }, DISCONNECT_TIMEOUT_MS);

  disconnectTimers.set(timerKey, timer);
  disconnectTimerStarts.set(timerKey, Date.now());
  socket.to(gameId).emit('opponent_left', { seconds: DISCONNECT_TIMEOUT_MS / 1000 });
}

/**
 * @brief Enregistre l'événement `leave_game`.
 *
 * Déclenché quand le joueur quitte volontairement la page de jeu.
 * Retire le joueur de la file d'attente s'il y était, sinon démarre
 * le timer de forfait.
 *
 * @param io     Instance du serveur Socket.IO.
 * @param socket Socket du joueur qui quitte.
 */
export function registerLeaveGame(io: Server, socket: Socket): void {
  socket.on('leave_game', ({ gameId }: { gameId: string }) => {
    const userId = socket.data.userId as number;

    const game = gameId ? multiGames.get(gameId) : null;
    const isActiveGame = game && game.gameStatus !== 'checkmate' && game.gameStatus !== 'stalemate' && game.gameStatus !== 'draw' && game.gameStatus !== 'resign';

    if (isActiveGame) {
      if (waitingPlayer === socket.id) {
        setWaitingPlayer(null);
        return;
      }
      startForfeitTimer(io, socket, gameId, userId);
      return;
    }

    if (gameId) socket.leave(gameId);

    if (!game && waitingPlayer === socket.id) {
      setWaitingPlayer(null);
    }
  });
}

/**
 * @brief Enregistre l'événement `disconnect`.
 *
 * Déclenché automatiquement par Socket.IO lors d'une déconnexion réseau.
 * Si un timer `leave_game` est déjà actif pour ce joueur, rien ne se passe
 * (évite de démarrer deux timers en parallèle).
 *
 * @param io     Instance du serveur Socket.IO.
 * @param socket Socket du joueur déconnecté.
 */
export function registerDisconnect(io: Server, socket: Socket): void {
  socket.on('disconnect', () => {
    if (waitingPlayer === socket.id) { setWaitingPlayer(null); return; }

    const gameId = socket.data.id_game as string | undefined;
    if (!gameId) return;

    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate' || game.gameStatus === 'draw' || game.gameStatus === 'resign') return;

    const userId = socket.data.userId as number;
    const timerKey = `${gameId}:${userId}`;
    if (disconnectTimers.has(timerKey)) return;

    startForfeitTimer(io, socket, gameId, userId);
  });
}

/**
 * @brief Enregistre les événements de visibilité de page.
 *
 * `player_hidden` : l'utilisateur a changé d'onglet sans fermer le tab.
 *   → démarre le timer de forfait si une partie est en cours.
 * `player_visible` : l'utilisateur est revenu sur l'onglet.
 *   → annule le timer de forfait.
 */
export function registerPlayerVisibility(io: Server, socket: Socket): void {
  socket.on('player_hidden', () => {
    const gameId = socket.data.id_game as string | undefined;
    if (!gameId) return;
    const userId = socket.data.userId as number;
    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate' || game.gameStatus === 'draw' || game.gameStatus === 'resign') return;
    startForfeitTimer(io, socket, gameId, userId);
  });

  socket.on('player_visible', () => {
    const gameId = socket.data.id_game as string | undefined;
    if (!gameId) return;
    const userId = socket.data.userId as number;
    const timerKey = `${gameId}:${userId}`;
    const existing = disconnectTimers.get(timerKey);
    if (existing) {
      clearTimeout(existing);
      disconnectTimers.delete(timerKey);
      disconnectTimerStarts.delete(timerKey);
      socket.to(gameId).emit('opponent_back');
    }
  });
}
