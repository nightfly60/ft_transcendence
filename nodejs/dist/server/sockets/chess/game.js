import { DEFAULT_CONTEXT, } from './types.js';
import { initBoard, fromAlgebraic, getValidMoves, applyMove, computeGameStatus, computeValidMovesMap, } from './engine/index.js';
/**
 * @brief Crée une nouvelle partie d'échecs en position initiale.
 *
 * Initialise le plateau, fixe le tour aux blancs, et remet à zéro
 * l'historique, les pièces capturées et les droits de roque.
 *
 * @return Un objet ChessGame représentant l'état initial d'une partie.
 */
export function makeGame() {
    return {
        board: initBoard(),
        turn: 'w',
        gameStatus: 'playing',
        moveHistory: [],
        captured: [],
        lastMove: null,
        enPassantTarget: null,
        castlingRights: { ...DEFAULT_CONTEXT.castlingRights },
    };
}
/**
 * @brief Extrait le contexte de jeu (en passant + droits de roque) depuis l'état courant.
 *
 * @param game L'état courant de la partie.
 * @return Un GameContext prêt à être passé aux fonctions du moteur.
 */
export function getCtx(game) {
    return { enPassantTarget: game.enPassantTarget, castlingRights: game.castlingRights };
}
/**
 * @brief Construit l'état de la partie à envoyer au client.
 *
 * Sérialise le plateau, le tour, le statut, l'historique, les pièces capturées,
 * le dernier coup, et calcule la map des coups légaux pour le joueur courant.
 *
 * @param game L'état courant de la partie.
 * @return Un objet JSON-serialisable à émettre via socket.
 */
export function buildGameState(game) {
    return {
        board: game.board,
        turn: game.turn,
        gameStatus: game.gameStatus,
        moveHistory: game.moveHistory,
        captured: game.captured,
        lastMove: game.lastMove,
        enPassantTarget: game.enPassantTarget,
        castlingRights: game.castlingRights,
        validMoves: computeValidMovesMap(game.board, game.turn, getCtx(game)),
    };
}
/**
 * @brief Applique un coup à l'état de la partie et retourne le nouvel état.
 *
 * Délègue l'application du coup au moteur, met à jour le tour, le statut,
 * l'historique des coups, les pièces capturées, le dernier coup joué,
 * la cible en passant et les droits de roque.
 *
 * @param game  L'état courant de la partie.
 * @param fromR Ligne de départ de la pièce.
 * @param fromC Colonne de départ de la pièce.
 * @param toR   Ligne de destination.
 * @param toC   Colonne de destination.
 * @param promotion Type de pièce pour une promotion de pion.
 * @return Un nouvel objet ChessGame reflétant l'état après le coup.
 */
export function applyMoveToGame(game, fromR, fromC, toR, toC, promotion) {
    const ctx = getCtx(game);
    const files = 'abcdefgh';
    const from = `${files[fromC]}${8 - fromR}`;
    const to = `${files[toC]}${8 - toR}`;
    const { board: newBoard, captured, newEnPassantTarget, newCastlingRights } = applyMove(game.board, fromR, fromC, toR, toC, { promotion, ctx });
    const nextTurn = game.turn === 'w' ? 'b' : 'w';
    const newCtx = { enPassantTarget: newEnPassantTarget, castlingRights: newCastlingRights };
    return {
        board: newBoard,
        turn: nextTurn,
        gameStatus: computeGameStatus(newBoard, nextTurn, newCtx),
        moveHistory: [...game.moveHistory, `${from}-${to}`],
        captured: captured ? [...game.captured, captured] : game.captured,
        lastMove: [[fromR, fromC], [toR, toC]],
        enPassantTarget: newEnPassantTarget,
        castlingRights: newCastlingRights,
    };
}
/**
 * @brief Valide un coup reçu depuis le client avant de l'appliquer.
 *
 * Vérifie que la case de départ contient une pièce du bon joueur,
 * que la couleur correspond au joueur autorisé (ou est ignorée en solo),
 * et que la destination fait partie des coups légaux calculés par le moteur.
 *
 * @param socket      Le socket du joueur ayant émis le coup.
 * @param game        L'état courant de la partie.
 * @param from        La case de départ en notation algébrique (ex. 'e2').
 * @param to          La case de destination en notation algébrique (ex. 'e4').
 * @param playerColor La couleur du joueur ('w' ou 'b'), null en mode solo.
 * @return Les coordonnées {fromR, fromC, toR, toC} si valides, null sinon.
 */
export function parseAndValidate(socket, game, from, to, playerColor) {
    const [fromR, fromC] = fromAlgebraic(from);
    const [toR, toC] = fromAlgebraic(to);
    const piece = game.board[fromR][fromC];
    if (!piece || piece.color !== game.turn) {
        socket.emit('move_invalid', { reason: 'Not your turn or empty square' });
        return null;
    }
    if (playerColor !== null && piece.color !== playerColor) {
        socket.emit('move_invalid', { reason: 'Wrong color' });
        return null;
    }
    if (!getValidMoves(game.board, fromR, fromC, getCtx(game)).some(([r, c]) => r === toR && c === toC)) {
        socket.emit('move_invalid', { reason: 'Illegal move' });
        return null;
    }
    return { fromR, fromC, toR, toC };
}
/**
 * @brief Convertit la chaîne de promotion reçue du client en PieceType valide.
 *
 * Accepte uniquement 'Q', 'R', 'B' ou 'N'. Toute autre valeur (ou absence)
 * retourne 'Q' (Dame) par défaut.
 *
 * @param raw La chaîne brute envoyée par le client.
 * @return Le PieceType correspondant, ou 'Q' par défaut.
 */
export function toPromotionPiece(raw) {
    return ['Q', 'R', 'B', 'N'].includes(raw)
        ? raw
        : 'Q';
}
