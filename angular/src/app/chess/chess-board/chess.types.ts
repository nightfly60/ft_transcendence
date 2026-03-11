export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (Piece | null)[][];

export const SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

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
