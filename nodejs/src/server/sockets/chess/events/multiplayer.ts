import { Server, Socket } from 'socket.io';
import { ResultSetHeader } from 'mysql2';
import pool from '../../../db.js';
import { PieceColor, MultiGame } from '../types.js';
import { makeGame, buildGameState, applyMoveToGame, parseAndValidate, toPromotionPiece } from '../game.js';

const DISCONNECT_TIMEOUT_MS = 60_000;

let waitingPlayer: string | null = null;
const multiGames       = new Map<string, MultiGame>();
const playerGames      = new Map<number, string>();           // userId → gameId
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>(); // `${gameId}:${userId}` → timer

/**
 * @brief Enregistre les événements socket liés au mode multijoueur.
 */
export function registerMultiplayerEvents(io: Server, socket: Socket): void {

  /**
   * @brief Cherche un adversaire ou rejoint une partie existante.
   *
   * Si l'userId a déjà une partie active en mémoire, il y est réintégré
   * automatiquement (rejoin). Sinon, procède au matchmaking normal.
   */
  socket.on('find_game', async () => {
    const userId = socket.data.userId as number;
    console.log(`[find_game] socket=${socket.id} userId=${userId} | waitingPlayer=${waitingPlayer} | playerGames=${JSON.stringify([...playerGames])}`);

    const existingGameId = playerGames.get(userId);
    console.log(`[find_game] existingGameId pour userId=${userId}: ${existingGameId ?? 'aucun'}`);
    if (existingGameId) {
      const game = multiGames.get(existingGameId);
      console.log(`[find_game] game trouvé: ${game ? `status=${game.gameStatus}` : 'introuvable dans multiGames'}`);
      if (game && game.gameStatus !== 'checkmate' && game.gameStatus !== 'stalemate') {
        const color: 'w' | 'b' = userId === game.whiteUserId ? 'w' : 'b';
        if (color === 'w') game.white = socket.id;
        else game.black = socket.id;

        const timerKey = `${existingGameId}:${userId}`;
        const existing = disconnectTimers.get(timerKey);
        if (existing) {
          clearTimeout(existing);
          disconnectTimers.delete(timerKey);
          socket.to(existingGameId).emit('opponent_back');
          console.log(`[find_game] timer annulé pour timerKey=${timerKey}`);
        }

        socket.join(existingGameId);
        socket.data.id_game = existingGameId;
        socket.emit('game_ready', { gameId: existingGameId, color });
        socket.emit('game_state', buildGameState(game));
        console.log(`[find_game] userId=${userId} rejoint gameId=${existingGameId} en tant que ${color}`);
        return;
      }
      console.log(`[find_game] partie terminée ou introuvable, suppression playerGames userId=${userId}`);
      playerGames.delete(userId);
    }

    // ── Matchmaking normal ──
    if (waitingPlayer && waitingPlayer !== socket.id) {
      const waitingSocket = io.sockets.sockets.get(waitingPlayer);
      if (!waitingSocket || waitingSocket.data.userId === userId) {
        waitingPlayer = socket.id;
        socket.emit('waiting');
        return;
      }

      const [white, black] = Math.random() < 0.5
        ? [waitingPlayer, socket.id]
        : [socket.id, waitingPlayer];

      const whiteUserId = io.sockets.sockets.get(white)?.data.userId as number;
      const blackUserId = io.sockets.sockets.get(black)?.data.userId as number;
      console.log(`[find_game] match: white=${white}(userId=${whiteUserId}) vs black=${black}(userId=${blackUserId})`);

      let result: ResultSetHeader;
      try {
        [result] = await pool.query<ResultSetHeader>(
          'INSERT INTO Game (timestamp, id_player_one, id_player_second) VALUES (NOW(), ?, ?)',
          [whiteUserId, blackUserId]
        );
      } catch (err) {
        console.error('[find_game] erreur BDD lors de la création de la partie:', err);
        waitingPlayer = null;
        return;
      }
      const gameId = String(result.insertId);

      const game: MultiGame = { ...makeGame(), white, black, whiteUserId, blackUserId };
      socket.data.id_game = gameId;
      io.sockets.sockets.get(white === socket.id ? black : white)!.data.id_game = gameId;
      multiGames.set(gameId, game);
      playerGames.set(whiteUserId, gameId);
      playerGames.set(blackUserId, gameId);

      io.sockets.sockets.get(white)?.join(gameId);
      io.sockets.sockets.get(black)?.join(gameId);
      io.to(white).emit('game_ready', { gameId, color: 'w' });
      io.to(black).emit('game_ready', { gameId, color: 'b' });
      io.to(gameId).emit('game_state', buildGameState(game));

      waitingPlayer = null;
      console.log(`[find_game] partie créée gameId=${gameId}`);
    } else {
      waitingPlayer = socket.id;
      socket.emit('waiting');
      console.log(`[find_game] userId=${userId} mis en attente`);
    }
  });

  /**
   * @brief Applique un coup et diffuse le nouvel état à la room.
   */
  socket.on('move', async ({ gameId, from, to, promotion }: { gameId: string; from: string; to: string; promotion?: string }) => {
    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') return;

    const playerColor: PieceColor = game.white === socket.id ? 'w' : 'b';
    const coords = parseAndValidate(socket, game, from, to, playerColor);
    if (!coords) return;

    const updated: MultiGame = {
      ...applyMoveToGame(game, coords.fromR, coords.fromC, coords.toR, coords.toC, toPromotionPiece(promotion)),
      white: game.white,
      black: game.black,
      whiteUserId: game.whiteUserId,
      blackUserId: game.blackUserId,
    };
    multiGames.set(gameId, updated);
    io.to(gameId).emit('game_state', buildGameState(updated));

    if (updated.gameStatus === 'checkmate') {
      playerGames.delete(updated.whiteUserId);
      playerGames.delete(updated.blackUserId);
      const winnerSocketId = playerColor === 'w' ? game.white : game.black;
      const winnerUserId = io.sockets.sockets.get(winnerSocketId)?.data.userId as number;
      await pool.query(
        'UPDATE Game SET id_winner = ?, nb_cuts = ? WHERE id = ?',
        [winnerUserId, updated.moveHistory.length, Number(gameId)]
      );
    }
  });

  /**
   * @brief Traite l'abandon d'un joueur en multijoueur.
   */
  socket.on('multi_resign', async ({ gameId }: { gameId: string }) => {
    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') return;

    const resignColor: PieceColor = game.white === socket.id ? 'w' : 'b';
    const resigned: MultiGame = { ...game, turn: resignColor, gameStatus: 'checkmate' };
    multiGames.set(gameId, resigned);
    playerGames.delete(game.whiteUserId);
    playerGames.delete(game.blackUserId);
    io.to(gameId).emit('game_state', buildGameState(resigned));

    const winnerSocketId = resignColor === 'w' ? game.black : game.white;
    const winnerUserId = io.sockets.sockets.get(winnerSocketId)?.data.userId as number;
    await pool.query(
      'UPDATE Game SET id_winner = ?, nb_cuts = ? WHERE id = ?',
      [winnerUserId, game.moveHistory.length, Number(gameId)]
    );
  });

  /**
   * @brief Démarre un timer de forfait quand le joueur quitte la page multijoueur.
   *
   * Si le joueur était en file d'attente, il en est simplement retiré.
   */
  socket.on('leave_game', ({ gameId }: { gameId: string }) => {
    if (waitingPlayer === socket.id) {
      waitingPlayer = null;
      console.log(`[leave_game] userId=${socket.data.userId} était en attente, retiré de la file`);
      return;
    }

    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') return;

    const userId   = socket.data.userId as number;
    const timerKey = `${gameId}:${userId}`;
    if (disconnectTimers.has(timerKey)) return;

    const timer = setTimeout(async () => {
      disconnectTimers.delete(timerKey);
      const currentGame = multiGames.get(gameId);
      if (!currentGame || currentGame.gameStatus === 'checkmate' || currentGame.gameStatus === 'stalemate') return;

      const resignColor: PieceColor = userId === currentGame.whiteUserId ? 'w' : 'b';
      const forfeited: MultiGame = { ...currentGame, turn: resignColor, gameStatus: 'checkmate' };
      multiGames.set(gameId, forfeited);
      playerGames.delete(currentGame.whiteUserId);
      playerGames.delete(currentGame.blackUserId);
      io.to(gameId).emit('game_state', buildGameState(forfeited));

      const winnerUserId = resignColor === 'w' ? currentGame.blackUserId : currentGame.whiteUserId;
      await pool.query(
        'UPDATE Game SET id_winner = ?, nb_cuts = ? WHERE id = ?',
        [winnerUserId, currentGame.moveHistory.length, Number(gameId)]
      );
      console.log(`[leave_game] timeout: userId=${userId} forfait dans gameId=${gameId}`);
    }, DISCONNECT_TIMEOUT_MS);

    disconnectTimers.set(timerKey, timer);
    socket.to(gameId).emit('opponent_left', { seconds: DISCONNECT_TIMEOUT_MS / 1000 });
    console.log(`[leave_game] userId=${userId} a quitté la page, timer 60s démarré`);
  });

  /**
   * @brief Nettoie la file d'attente ou démarre un timer de forfait si déconnexion.
   */
  socket.on('disconnect', () => {
    if (waitingPlayer === socket.id) { waitingPlayer = null; return; }

    const gameId = socket.data.id_game as string | undefined;
    if (!gameId) return;

    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') return;

    const userId   = socket.data.userId as number;
    const timerKey = `${gameId}:${userId}`;
    if (disconnectTimers.has(timerKey)) return; // timer déjà lancé par leave_game

    const timer = setTimeout(async () => {
      disconnectTimers.delete(timerKey);
      const currentGame = multiGames.get(gameId);
      if (!currentGame || currentGame.gameStatus === 'checkmate' || currentGame.gameStatus === 'stalemate') return;

      const resignColor: PieceColor = userId === currentGame.whiteUserId ? 'w' : 'b';
      const forfeited: MultiGame = { ...currentGame, turn: resignColor, gameStatus: 'checkmate' };
      multiGames.set(gameId, forfeited);
      playerGames.delete(currentGame.whiteUserId);
      playerGames.delete(currentGame.blackUserId);
      io.to(gameId).emit('game_state', buildGameState(forfeited));

      const winnerUserId = resignColor === 'w' ? currentGame.blackUserId : currentGame.whiteUserId;
      await pool.query(
        'UPDATE Game SET id_winner = ?, nb_cuts = ? WHERE id = ?',
        [winnerUserId, currentGame.moveHistory.length, Number(gameId)]
      );
      console.log(`[disconnect] timeout: userId=${userId} forfait dans gameId=${gameId}`);
    }, DISCONNECT_TIMEOUT_MS);

    disconnectTimers.set(timerKey, timer);
    socket.to(gameId).emit('opponent_left', { seconds: DISCONNECT_TIMEOUT_MS / 1000 });
    console.log(`[disconnect] userId=${userId} déconnecté de gameId=${gameId}, timer 60s démarré`);
  });
}
