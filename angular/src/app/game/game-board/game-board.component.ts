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
}
