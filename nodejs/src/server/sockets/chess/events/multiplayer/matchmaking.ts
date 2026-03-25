import { Server, Socket } from 'socket.io';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../../../db.js';
import { MultiGame } from '../../types.js';
import { makeGame, buildGameState } from '../../game.js';
import { waitingPlayer, setWaitingPlayer, multiGames, playerGames, disconnectTimers } from './state.js';
import { createGameConversation } from '../../../../services/conversation.service.js';

/**
 * @brief Récupère les noms d'utilisateur depuis la base de données.
 *
 * @param userIds Liste des ids à interroger (exactement 2).
 * @return Un dictionnaire userId → username.
 */
async function fetchUsernames(userIds: number[]): Promise<Record<number, string>> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, username FROM `User` WHERE id IN (?, ?)',
    userIds
  );
  const map: Record<number, string> = {};
  (rows as RowDataPacket[]).forEach(r => { map[r['id']] = r['username']; });
  return map;
}

/**
 * @brief Fait rejoindre un joueur dans sa partie existante.
 *
 * Annule le timer de forfait éventuel, met à jour le socket ID du joueur
 * dans l'état de la partie et lui renvoie l'état courant.
 *
 * @param socket Socket du joueur qui rejoint.
 * @param gameId Identifiant de la partie à rejoindre.
 * @param game   État courant de la partie.
 * @param userId Id du joueur qui rejoint.
 */
async function rejoinGame(socket: Socket, gameId: string, game: MultiGame, userId: number): Promise<void> {
  const color: 'w' | 'b' = userId === game.whiteUserId ? 'w' : 'b';
  if (color === 'w') game.white = socket.id;
  else game.black = socket.id;

  const timerKey = `${gameId}:${userId}`;
  const existing = disconnectTimers.get(timerKey);
  if (existing) {
    clearTimeout(existing);
    disconnectTimers.delete(timerKey);
    socket.to(gameId).emit('opponent_back');
    console.log(`[find_game] timer annulé pour timerKey=${timerKey}`);
  }

  socket.join(gameId);
  socket.data.id_game = gameId;

  const userMap = await fetchUsernames([game.whiteUserId, game.blackUserId]);
  socket.emit('game_ready', {
    gameId, color,
    whiteUsername: userMap[game.whiteUserId] ?? 'Blanc',
    blackUsername: userMap[game.blackUserId] ?? 'Noir',
  });
  socket.emit('game_state', buildGameState(game));
  console.log(`[find_game] userId=${userId} rejoint gameId=${gameId} en tant que ${color}`);
}

/**
 * @brief Crée une nouvelle partie entre le joueur en attente et le joueur entrant.
 *
 * Attribue aléatoirement les couleurs, insère la partie en BDD,
 * initialise l'état en mémoire et notifie les deux joueurs.
 *
 * @param io              Instance du serveur Socket.IO.
 * @param socket          Socket du joueur entrant.
 * @param waitingSocketId Socket ID du joueur déjà en attente.
 */
async function createGame(io: Server, socket: Socket, waitingSocketId: string): Promise<void> {
  const [white, black] = Math.random() < 0.5
    ? [waitingSocketId, socket.id]
    : [socket.id, waitingSocketId];

  const whiteSocket = io.sockets.sockets.get(white)!;
  const blackSocket = io.sockets.sockets.get(black)!;
  const whiteUserId = whiteSocket.data.userId as number;
  const blackUserId = blackSocket.data.userId as number;
  console.log(`[find_game] match: white=${white}(userId=${whiteUserId}) vs black=${black}(userId=${blackUserId})`);

  let result: ResultSetHeader;
  try {
    [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Game (timestamp, id_player_one, id_player_second) VALUES (NOW(), ?, ?)',
      [whiteUserId, blackUserId]
    );
  } catch (err) {
    console.error('[find_game] erreur BDD lors de la création de la partie:', err);
    setWaitingPlayer(null);
    return;
  }
  const gameId = String(result.insertId);

  const game: MultiGame = { ...makeGame(), white, black, whiteUserId, blackUserId };
  whiteSocket.data.id_game = gameId;
  blackSocket.data.id_game = gameId;
  multiGames.set(gameId, game);
  playerGames.set(whiteUserId, gameId);
  playerGames.set(blackUserId, gameId);

  whiteSocket.join(gameId);
  blackSocket.join(gameId);

  const userMap = await fetchUsernames([whiteUserId, blackUserId]);
  const whiteUsername = userMap[whiteUserId] ?? 'Blanc';
  const blackUsername = userMap[blackUserId] ?? 'Noir';

  io.to(white).emit('game_ready', { gameId, color: 'w', whiteUsername, blackUsername });
  io.to(black).emit('game_ready', { gameId, color: 'b', whiteUsername, blackUsername });
  io.to(gameId).emit('game_state', buildGameState(game));

  createGameConversation(whiteUserId, blackUserId, result.insertId); // <------------- create chat gael

  setWaitingPlayer(null);
  console.log(`[find_game] partie créée gameId=${gameId}`);
}

/**
 * @brief Enregistre l'événement `find_game`.
 *
 * Si le joueur a une partie en cours non terminée, il la rejoint.
 * Sinon, s'il y a un joueur en attente compatible, une nouvelle partie est créée.
 * Sinon, le joueur est mis en file d'attente.
 *
 * @param io     Instance du serveur Socket.IO.
 * @param socket Socket du joueur.
 */
export function registerFindGame(io: Server, socket: Socket): void {
  socket.on('find_game', async () => {
    const userId = socket.data.userId as number;
    console.log(`[find_game] socket=${socket.id} userId=${userId} | waitingPlayer=${waitingPlayer} | playerGames=${JSON.stringify([...playerGames])}`);
    const existingGameId = playerGames.get(userId);
    console.log(`[find_game] existingGameId pour userId=${userId}: ${existingGameId ?? 'aucun'}`);

    if (existingGameId) {
      const game = multiGames.get(existingGameId);
      console.log(`[find_game] game trouvé: ${game ? `status=${game.gameStatus}` : 'introuvable dans multiGames'}`);
      if (game && game.gameStatus !== 'checkmate' && game.gameStatus !== 'stalemate' && game.gameStatus !== 'draw' && game.gameStatus !== 'resign') {
        await rejoinGame(socket, existingGameId, game, userId);
        return;
      }
      console.log(`[find_game] partie terminée ou introuvable, suppression playerGames userId=${userId}`);
      playerGames.delete(userId);
    }

    const waiting = waitingPlayer;
    const waitingSocket = waiting ? io.sockets.sockets.get(waiting) : null;
    if (waitingSocket && waitingSocket.data.userId !== userId) {
      await createGame(io, socket, waiting!);
    } else {
      setWaitingPlayer(socket.id);
      socket.emit('waiting');
      console.log(`[find_game] userId=${userId} mis en attente`);
    }
  });
}
