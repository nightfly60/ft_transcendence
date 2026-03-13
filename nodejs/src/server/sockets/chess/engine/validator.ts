import { Board, PieceColor, GameStatus, GameContext, DEFAULT_CONTEXT } from '../types.js';
import { fromAlgebraic } from './board.js';
import { getRawMoves } from './moves.js';

/**
 * @brief Simule un coup sur une copie du plateau sans modifier l'original.
 *
 * Déplace la pièce de (fromR, fromC) vers (toR, toC) et gère les cas
 * spéciaux : prise en passant (supprime le pion capturé sur sa vraie case)
 * et roque (déplace également la tour vers sa case de destination).
 *
 * @param board Le plateau original (non modifié).
 * @param fromR Ligne de départ.
 * @param fromC Colonne de départ.
 * @param toR   Ligne de destination.
 * @param toC   Colonne de destination.
 * @param ctx   Contexte de jeu (cible en passant, droits de roque).
 * @return Un nouveau plateau reflétant le coup simulé.
 */
function simulateMove(board: Board, fromR: number, fromC: number, toR: number, toC: number, ctx: GameContext): Board {
  const sim = board.map(row => [...row]);
  const piece = sim[fromR][fromC]!;
  sim[toR][toC] = piece;
  sim[fromR][fromC] = null;
  if (piece.type === 'P' && ctx.enPassantTarget) {
    const [epR, epC] = fromAlgebraic(ctx.enPassantTarget);
    if (toR === epR && toC === epC)
      sim[piece.color === 'w' ? toR + 1 : toR - 1][toC] = null;
  }
  if (piece.type === 'K' && Math.abs(toC - fromC) === 2) {
    if (toC === 6) { sim[fromR][5] = sim[fromR][7]; sim[fromR][7] = null; }
    else           { sim[fromR][3] = sim[fromR][0]; sim[fromR][0] = null; }
  }
  return sim;
}

/**
 * @brief Vérifie si le roi de la couleur donnée est actuellement en échec.
 *
 * Localise le roi puis teste si une pièce adverse peut l'atteindre
 * via ses coups bruts (sans contexte : le roque et l'en passant
 * ne peuvent pas constituer un échec).
 *
 * @param board  Le plateau à analyser.
 * @param color  La couleur du roi à tester ('w' ou 'b').
 * @return true si le roi est en échec, false sinon.
 */
export function isKingInCheck(board: Board, color: PieceColor): boolean {
  let kingR = -1, kingC = -1;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === 'K' && board[r][c]?.color === color)
        { kingR = r; kingC = c; }
  const enemy: PieceColor = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === enemy)
        if (getRawMoves(board, r, c).some(([ar, ac]) => ar === kingR && ac === kingC))
          return true;
  return false;
}

/**
 * @brief Retourne les coups légaux de la pièce en (row, col).
 *
 * Filtre les coups bruts selon trois règles :
 * 1. Le coup ne doit pas laisser le roi en échec.
 * 2. Pour le roque : le roi ne peut pas être en échec au moment de roquer.
 * 3. Pour le roque : le roi ne peut pas traverser une case attaquée.
 *
 * @param board Le plateau courant.
 * @param row   Ligne de la pièce.
 * @param col   Colonne de la pièce.
 * @param ctx   Contexte de jeu (défaut : DEFAULT_CONTEXT).
 * @return La liste des cases légalement atteignables.
 */
export function getValidMoves(board: Board, row: number, col: number, ctx: GameContext = DEFAULT_CONTEXT): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];
  return getRawMoves(board, row, col, ctx).filter(([tr, tc]) => {
    if (isKingInCheck(simulateMove(board, row, col, tr, tc, ctx), piece.color)) return false;
    if (piece.type === 'K' && Math.abs(tc - col) === 2) {
      if (isKingInCheck(board, piece.color)) return false;
      if (isKingInCheck(simulateMove(board, row, col, row, (col + tc) / 2, ctx), piece.color)) return false;
    }
    return true;
  });
}

/**
 * @brief Calcule le statut de la partie pour le joueur color.
 *
 * Détermine si la position est normale, en échec, en mat ou en pat
 * en combinant isKingInCheck et la recherche d'un coup légal.
 *
 * @param board Le plateau courant.
 * @param color La couleur du joueur dont c'est le tour.
 * @param ctx   Contexte de jeu (défaut : DEFAULT_CONTEXT).
 * @return 'checkmate' | 'stalemate' | 'check' | 'playing'.
 */
export function computeGameStatus(board: Board, color: PieceColor, ctx: GameContext = DEFAULT_CONTEXT): GameStatus {
  const inCheck  = isKingInCheck(board, color);
  const hasLegal = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) =>
      board[r][c]?.color === color && getValidMoves(board, r, c, ctx).length > 0
    )
  ).flat().some(Boolean);
  if (!hasLegal && inCheck) return 'checkmate';
  if (!hasLegal) return 'stalemate';
  if (inCheck) return 'check';
  return 'playing';
}
