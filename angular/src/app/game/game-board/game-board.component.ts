import { Component, input, output, signal } from '@angular/core';
import { GameMode } from '../game-mode-select/game-mode-select.component';

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
type PieceColor = 'w' | 'b';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Board = (Piece | null)[][];

const SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

function initBoard(): Board {
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

@Component({
  selector: 'app-game-board',
  standalone: true,
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoardComponent {
  gameId = input.required<string>();
  mode = input.required<GameMode>();
  movePlayed = output<{ from: string; to: string }>();
  

  board = signal<Board>(initBoard())
  selected = signal<[number, number] | null > (null)
  validMoves =  signal<[number,number][]>([])
  turn = signal<PieceColor>('w');
  rows  = [0,1,2,3,4,5,6,7];
  cols  = [0,1,2,3,4,5,6,7];
  files = ['a','b','c','d','e','f','g','h'];

  moveHistory = signal<string[]>([]);
  movePairs   = () => [];
  captured    = signal<Piece[]>([]);

isLight(r: number, c: number)   { return (r + c) % 2 === 0; }
symbol(piece: Piece | null)     { return piece ? SYMBOLS[piece.color][piece.type] : ''; }
isSelected(r: number, c: number){ return false; }
isLastMove(r: number, c: number){ return false; }
isValidMove(r: number, c: number){ return false; }
capturedSymbols(color: PieceColor){ return ''; }
clickSquare(r: number, c: number){}
resetGame(){}

  private case_exist(row: number, col: number):boolean
  {
    return row >=0 && row < 8 && col >= 0 && col < 8;
  }
  private case_empty(board: Board,row: number,col: number)
  {
    return board[row][col] === null
  }
  private isEnemy(board: Board, piece: Piece, row: number, col: number): boolean {
  return board[row][col] !== null && board[row][col]?.color !== piece.color;
  }

  private is_deplacable(board: Board, piece: Piece, row: number, col: number): boolean {
  return this.case_exist(row, col) && (this.case_empty(board, row, col) || this.isEnemy(board, piece, row, col));
  }
}
