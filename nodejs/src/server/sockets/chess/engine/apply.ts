import { Board, Piece, PieceType, PieceColor, GameContext, CastlingRights, MoveResult, DEFAULT_CONTEXT } from '../types.js';
import { toAlgebraic, fromAlgebraic } from './board.js';
import { getValidMoves } from './validator.js';

/**
 * @brief Met à jour les droits de roque après un coup.
 *
 * Révoque les droits dans les cas suivants :
 * - Le roi bouge : perd les deux roques de sa couleur.
 * - Une tour quitte son coin initial : perd le roque de ce côté.
 * - Une tour est capturée dans son coin initial : perd le roque de ce côté.
 *
 * @param rights Les droits de roque avant le coup.
 * @param fromR  Ligne de départ de la pièce jouée.
 * @param fromC  Colonne de départ de la pièce jouée.
 * @param toR    Ligne de destination de la pièce jouée.
 * @param toC    Colonne de destination de la pièce jouée.
 * @param piece  La pièce qui vient de se déplacer.
 * @return Les droits de roque mis à jour.
 */
function updateCastlingRights(
  rights: CastlingRights,
  fromR: number, fromC: number,
  toR: number, toC: number,
  piece: Piece,
): CastlingRights {
  const r = { ...rights };
  if (piece.type === 'K') {
    if (piece.color === 'w') { r.wK = false; r.wQ = false; }
    else                     { r.bK = false; r.bQ = false; }
  }
  if (piece.type === 'R') {
    if (fromR === 7 && fromC === 7) r.wK = false;
    if (fromR === 7 && fromC === 0) r.wQ = false;
    if (fromR === 0 && fromC === 7) r.bK = false;
    if (fromR === 0 && fromC === 0) r.bQ = false;
  }
  if (toR === 7 && toC === 7) r.wK = false;
  if (toR === 7 && toC === 0) r.wQ = false;
  if (toR === 0 && toC === 7) r.bK = false;
  if (toR === 0 && toC === 0) r.bQ = false;
  return r;
}

/**
 * @brief Applique un coup sur le plateau et retourne le nouvel état.
 *
 * Gère les cas spéciaux : prise en passant (supprime le pion capturé),
 * promotion (remplace le pion par la pièce choisie) et roque
 * (déplace la tour vers sa case de destination).
 *
 * @param board   Le plateau avant le coup.
 * @param fromR   Ligne de départ de la pièce.
 * @param fromC   Colonne de départ de la pièce.
 * @param toR     Ligne de destination.
 * @param toC     Colonne de destination.
 * @param options Options facultatives : pièce de promotion et contexte de jeu.
 * @return Un MoveResult contenant le nouveau plateau, la pièce capturée,
 *         la nouvelle cible en passant et les droits de roque mis à jour.
 */
export function applyMove(
  board: Board,
  fromR: number, fromC: number,
  toR: number, toC: number,
  options: { promotion?: PieceType; ctx?: GameContext } = {},
): MoveResult {
  const ctx      = options.ctx ?? DEFAULT_CONTEXT;
  const newBoard = board.map(row => [...row]);
  const piece    = newBoard[fromR][fromC]!;

  let captured: Piece | null = null;
  if (piece.type === 'P' && ctx.enPassantTarget) {
    const [epR, epC] = fromAlgebraic(ctx.enPassantTarget);
    if (toR === epR && toC === epC) {
      const capturedRow = piece.color === 'w' ? toR + 1 : toR - 1;
      captured = newBoard[capturedRow][toC];
      newBoard[capturedRow][toC] = null;
    }
  }
  captured ??= newBoard[toR][toC];

  newBoard[toR][toC] = (piece.type === 'P' && (toR === 0 || toR === 7))
    ? { type: options.promotion ?? 'Q', color: piece.color }
    : piece;
  newBoard[fromR][fromC] = null;

  if (piece.type === 'K' && Math.abs(toC - fromC) === 2) {
    if (toC === 6) { newBoard[fromR][5] = newBoard[fromR][7]; newBoard[fromR][7] = null; }
    else           { newBoard[fromR][3] = newBoard[fromR][0]; newBoard[fromR][0] = null; }
  }

  return {
    board: newBoard,
    captured,
    newEnPassantTarget: (piece.type === 'P' && Math.abs(toR - fromR) === 2)
      ? toAlgebraic((fromR + toR) / 2, toC)
      : null,
    newCastlingRights: updateCastlingRights(ctx.castlingRights, fromR, fromC, toR, toC, piece),
  };
}

/**
 * @brief Calcule la map des coups légaux pour toutes les pièces du joueur color.
 *
 * Retourne un dictionnaire dont les clés sont les cases occupées par une pièce
 * du joueur et les valeurs sont les cases légalement atteignables depuis celles-ci.
 * Utilisé par le frontend pour afficher les coups disponibles sans logique locale.
 *
 * @param board Le plateau courant.
 * @param color La couleur du joueur dont on calcule les coups.
 * @param ctx   Contexte de jeu (défaut : DEFAULT_CONTEXT).
 * @return Un objet ex. { 'e2': ['e3', 'e4'], 'g1': ['f3', 'h3'], ... }.
 */
export function computeValidMovesMap(board: Board, color: PieceColor, ctx: GameContext = DEFAULT_CONTEXT): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === color) {
        const moves = getValidMoves(board, r, c, ctx);
        if (moves.length > 0)
          map[toAlgebraic(r, c)] = moves.map(([mr, mc]) => toAlgebraic(mr, mc));
      }
  return map;
}
