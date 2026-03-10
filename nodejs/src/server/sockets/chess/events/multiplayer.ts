import { Server, Socket } from 'socket.io';
import { ResultSetHeader } from 'mysql2';
import pool from '../../../db.js';
import { PieceColor, MultiGame } from '../types.js';
import { makeGame, buildGameState, applyMoveToGame, parseAndValidate, toPromotionPiece } from '../game.js';

let waitingPlayer: string | null = null;
const multiGames = new Map<string, MultiGame>();

/**
 * @brief Enregistre les événements socket liés au mode multijoueur.
 *
 * Gère le matchmaking (find_game), l'application des coups (move)
 * et l'abandon de partie (multi_resign). À chaque partie trouvée,
 * crée un enregistrement en base de données et utilise son id comme
 * identifiant de room socket. Met à jour le gagnant en BDD en fin de partie.
 *
 * @param io     L'instance du serveur Socket.IO.
 * @param socket Le socket du joueur qui vient de se connecter.
 * @return Aucune valeur de retour.
 */
export function registerMultiplayerEvents(io: Server, socket: Socket): void {

  /**
   * @brief Cherche un adversaire et démarre la partie si un joueur attend.
   *
   * Si un joueur est déjà en attente, associe les deux joueurs aléatoirement
   * aux couleurs blanc/noir, crée la Game en BDD, initialise l'état en mémoire
   * et émet game_ready + game_state aux deux joueurs.
   * Sinon, place le joueur courant en file d'attente et lui émet waiting.
   */
  socket.on('find_game', async () => {
    if (waitingPlayer && waitingPlayer !== socket.id) {
      const [white, black] = Math.random() < 0.5
        ? [waitingPlayer, socket.id]
        : [socket.id, waitingPlayer];

      const whiteUserId = io.sockets.sockets.get(white)?.data.userId as number;
      const blackUserId = io.sockets.sockets.get(black)?.data.userId as number;

      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO Game (timestamp, id_player_one, id_player_second) VALUES (NOW(), ?, ?)',
        [whiteUserId, blackUserId]
      );
      const gameId = String(result.insertId);

      const game: MultiGame = { ...makeGame(), white, black };
      multiGames.set(gameId, game);

      io.sockets.sockets.get(white)?.join(gameId);
      io.sockets.sockets.get(black)?.join(gameId);
      io.to(white).emit('game_ready', { gameId, color: 'w' });
      io.to(black).emit('game_ready', { gameId, color: 'b' });
      io.to(gameId).emit('game_state', buildGameState(game));

      waitingPlayer = null;
    } else {
      waitingPlayer = socket.id;
      socket.emit('waiting');
    }
  });

  /**
   * @brief Applique un coup d'un joueur et diffuse le nouvel état à la room.
   *
   * Vérifie que la partie existe et n'est pas terminée, valide le coup
   * par rapport à la couleur du joueur, puis applique le coup.
   * Si le coup mène au mat, enregistre le gagnant et le nombre de coups en BDD.
   *
   * @param gameId    Identifiant de la partie (= id BDD converti en string).
   * @param from      Case de départ en notation algébrique.
   * @param to        Case de destination en notation algébrique.
   * @param promotion Pièce de promotion (optionnel, 'Q' par défaut).
   */
  socket.on('move', async ({ gameId, from, to, promotion, }: { gameId: string; from: string; to: string; promotion?: string }) => {
    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') return;

    const playerColor: PieceColor = game.white === socket.id ? 'w' : 'b';
    const coords = parseAndValidate(socket, game, from, to, playerColor);
    if (!coords) return;

    const updated: MultiGame = {
      ...applyMoveToGame(game, coords.fromR, coords.fromC, coords.toR, coords.toC, toPromotionPiece(promotion)),
      white: game.white,
      black: game.black,
    };
    multiGames.set(gameId, updated);
    io.to(gameId).emit('game_state', buildGameState(updated));

    if (updated.gameStatus === 'checkmate') {
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
   *
   * Marque la partie comme terminée (checkmate) avec le joueur adverse
   * comme gagnant, diffuse le nouvel état et met à jour la BDD.
   *
   * @param gameId Identifiant de la partie à abandonner.
   */
  socket.on('multi_resign', async ({ gameId }: { gameId: string }) => {
    const game = multiGames.get(gameId);
    if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') return;

    const resignColor: PieceColor = game.white === socket.id ? 'w' : 'b';
    const resigned: MultiGame = { ...game, turn: resignColor, gameStatus: 'checkmate', white: game.white, black: game.black };
    multiGames.set(gameId, resigned);
    io.to(gameId).emit('game_state', buildGameState(resigned));

    const winnerSocketId = resignColor === 'w' ? game.black : game.white;
    const winnerUserId = io.sockets.sockets.get(winnerSocketId)?.data.userId as number;
    await pool.query(
      'UPDATE Game SET id_winner = ?, nb_cuts = ? WHERE id = ?',
      [winnerUserId, game.moveHistory.length, Number(gameId)]
    );
  });

  /**
   * @brief Nettoie la file d'attente si le joueur se déconnecte en attente.
   */
  socket.on('disconnect', () => {
    if (waitingPlayer === socket.id) waitingPlayer = null;
  });
}
