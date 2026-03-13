import { Board, PieceType } from '../types.js';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/**
 * @brief Initialise le plateau en position de départ standard.
 *
 * Place les pièces noires sur les rangées 0-1 et les pièces blanches
 * sur les rangées 6-7 selon l'ordre RNBQKBNR.
 *
 * @return Un plateau 8×8 avec toutes les pièces en position initiale.
 */
export function initBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const order: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  order.forEach((t, c) => {
    b[0][c] = { type: t, color: 'b' };
    b[7][c] = { type: t, color: 'w' };
  });
  for (let c = 0; c < 8; c++) {
    b[1][c] = { type: 'P', color: 'b' };
    b[6][c] = { type: 'P', color: 'w' };
  }
  return b;
}

/**
 * @brief Convertit des coordonnées internes en notation algébrique.
 *
 * @param row Indice de ligne (0 = rangée 8, 7 = rangée 1).
 * @param col Indice de colonne (0 = colonne a, 7 = colonne h).
 * @return La case en notation algébrique, ex. 'e1'.
 */
export function toAlgebraic(row: number, col: number): string {
  return `${FILES[col]}${8 - row}`;
}

/**
 * @brief Convertit une case en notation algébrique en coordonnées internes.
 *
 * @param sq La case en notation algébrique, ex. 'e1'.
 * @return Un tuple [ligne, colonne] correspondant à la case.
 */
export function fromAlgebraic(sq: string): [number, number] {
  return [8 - parseInt(sq[1]), FILES.indexOf(sq[0])];
}
