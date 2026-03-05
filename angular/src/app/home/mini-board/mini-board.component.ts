import { Component } from '@angular/core';

@Component({
  selector: 'app-home-mini-board',
  imports: [],
  templateUrl: './mini-board.component.html',
  styleUrl: './mini-board.component.scss',
})
export class MiniBoardComponent {
  boardRows = [0, 1, 2, 3, 4, 5, 6, 7];
  boardCols = [0, 1, 2, 3, 4, 5, 6, 7];

  private initialBoard: string[][] = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  ];

  getPiece(row: number, col: number): string {
    return this.initialBoard[row][col];
  }
}
