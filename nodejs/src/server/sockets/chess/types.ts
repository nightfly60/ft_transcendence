export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (Piece | null)[][];

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface GameContext {
  enPassantTarget: string | null;
  castlingRights: CastlingRights;
}

export interface MoveResult {
  board: Board;
  captured: Piece | null;
  newEnPassantTarget: string | null;
  newCastlingRights: CastlingRights;
}

export const DEFAULT_CONTEXT: GameContext = {
  enPassantTarget: null,
  castlingRights: { wK: true, wQ: true, bK: true, bQ: true },
};

export interface ChessGame {
  board: Board;
  turn: PieceColor;
  gameStatus: GameStatus;
  moveHistory: string[];
  captured: Piece[];
  lastMove: [[number, number], [number, number]] | null;
  enPassantTarget: string | null;
  castlingRights: CastlingRights;
}

export interface MultiGame extends ChessGame {
  white: string;
  black: string;
}
