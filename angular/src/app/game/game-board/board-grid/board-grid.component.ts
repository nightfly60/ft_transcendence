import { Component, input, output } from '@angular/core';
import { Board, Piece, SYMBOLS } from '../chess.types';

@Component({
  selector: 'app-board-grid',
  standalone: true,
  templateUrl: './board-grid.component.html',
  styleUrl: './board-grid.component.scss',
})
export class BoardGridComponent {
  board      = input.required<Board>();
  selected   = input<[number, number] | null>(null);
  validMoves = input<[number, number][]>([]);
  lastMove   = input<[[number, number], [number, number]] | null>(null);
  squareClick = output<{ r: number; c: number }>();

  rows  = [0,1,2,3,4,5,6,7];
  cols  = [0,1,2,3,4,5,6,7];
  files = ['a','b','c','d','e','f','g','h'];

  isLight(r: number, c: number): boolean    { return (r + c) % 2 === 0; }
  symbol(piece: Piece | null): string       { return piece ? SYMBOLS[piece.color][piece.type] : ''; }

  isSelected(r: number, c: number): boolean {
    const s = this.selected();
    return s !== null && s[0] === r && s[1] === c;
  }

  isLastMove(r: number, c: number): boolean {
    const lm = this.lastMove();
    if (!lm) return false;
    return (lm[0][0] === r && lm[0][1] === c) || (lm[1][0] === r && lm[1][1] === c);
  }

  isValidMove(r: number, c: number): boolean {
    return this.validMoves().some(([mr, mc]) => mr === r && mc === c);
  }

  click(r: number, c: number): void {
    this.squareClick.emit({ r, c });
  }
}
