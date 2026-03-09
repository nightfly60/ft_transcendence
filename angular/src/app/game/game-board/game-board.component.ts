import { Component, input, output, signal } from '@angular/core';
import { GameMode } from '../game-mode-select/game-mode-select.component';
import { Board, Piece, PieceColor, SYMBOLS, initBoard } from './chess.types';
import { PlayerPanelComponent } from './player-panel/player-panel.component';
import { BoardGridComponent } from './board-grid/board-grid.component';
import { MoveHistoryComponent } from './move-history/move-history.component';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [PlayerPanelComponent, BoardGridComponent, MoveHistoryComponent],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoardComponent {
  gameId = input.required<string>();
  mode   = input.required<GameMode>();
  movePlayed = output<{ from: string; to: string }>();

  readonly files = ['a','b','c','d','e','f','g','h'];

  board       = signal<Board>(initBoard());
  selected    = signal<[number, number] | null>(null);
  validMoves  = signal<[number, number][]>([]);
  turn        = signal<PieceColor>('w');
  moveHistory = signal<string[]>([]);
  lastMove    = signal<[[number,number],[number,number]] | null>(null);
  captured    = signal<Piece[]>([]);

  movePairs(): { n: number; w: string; b: string }[] {
    const h = this.moveHistory();
    const pairs: { n: number; w: string; b: string }[] = [];
    for (let i = 0; i < h.length; i += 2) {
      pairs.push({ n: Math.floor(i / 2) + 1, w: h[i], b: h[i + 1] ?? '' });
    }
    return pairs;
  }

  capturedSymbols(color: PieceColor): string {
    return this.captured()
      .filter(p => p.color === color)
      .map(p => SYMBOLS[p.color][p.type])
      .join('');
  }

  onSquareClick(event: { r: number; c: number }): void {
    const { r, c } = event;
    const board = this.board();
    const sel = this.selected();

    const isValid = this.validMoves().some(([mr, mc]) => mr === r && mc === c);
    if (sel && isValid) {
      this.playMove(sel[0], sel[1], r, c);
      return;
    }

    const piece = board[r][c];
    if (piece && piece.color === this.turn()) {
      this.selected.set([r, c]);
      this.validMoves.set(this.getValidMoves(board, r, c));
      return;
    }

    this.selected.set(null);
    this.validMoves.set([]);
  }

  private playMove(fromR: number, fromC: number, toR: number, toC: number): void {
    const board = this.board().map(row => [...row]);
    const piece = board[fromR][fromC]!;
    const target = board[toR][toC];

    if (target) this.captured.update(c => [...c, target]);

    board[toR][toC] = piece;
    board[fromR][fromC] = null;

    const notation = `${this.files[fromC]}${8 - fromR}-${this.files[toC]}${8 - toR}`;
    this.moveHistory.update(h => [...h, notation]);
    this.lastMove.set([[fromR, fromC], [toR, toC]]);
    this.board.set(board);
    this.turn.update(t => t === 'w' ? 'b' : 'w');
    this.selected.set(null);
    this.validMoves.set([]);

    this.movePlayed.emit({
      from: `${this.files[fromC]}${8 - fromR}`,
      to: `${this.files[toC]}${8 - toR}`,
    });
  }

  resetGame(): void {
    this.board.set(initBoard());
    this.selected.set(null);
    this.validMoves.set([]);
    this.turn.set('w');
    this.moveHistory.set([]);
    this.lastMove.set(null);
    this.captured.set([]);
  }

  // --- Génération des coups ---

  private getValidMoves(board: Board, row: number, col: number): [number, number][] {
    const piece = board[row][col];
    if (!piece) return [];
    const moves: [number, number][] = [];
    switch (piece.type) {
      case 'P': this.pawnMoves(board, piece, row, col, moves); break;
      case 'R': this.slidingMoves(board, piece, row, col, moves, [[0,1],[0,-1],[1,0],[-1,0]]); break;
      case 'B': this.slidingMoves(board, piece, row, col, moves, [[1,1],[1,-1],[-1,1],[-1,-1]]); break;
      case 'Q': this.slidingMoves(board, piece, row, col, moves, [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]); break;
      case 'N': this.knightMoves(board, piece, row, col, moves); break;
      case 'K': this.kingMoves(board, piece, row, col, moves); break;
    }
    return moves;
  }

  private pawnMoves(board: Board, piece: Piece, row: number, col: number, moves: [number, number][]): void {
    const dir = piece.color === 'w' ? -1 : 1;
    const startRow = piece.color === 'w' ? 6 : 1;
    if (this.exists(row + dir, col) && board[row + dir][col] === null) {
      moves.push([row + dir, col]);
      if (row === startRow && board[row + 2 * dir][col] === null)
        moves.push([row + 2 * dir, col]);
    }
    for (const dc of [-1, 1]) {
      if (this.exists(row + dir, col + dc) && this.isEnemy(board, piece, row + dir, col + dc))
        moves.push([row + dir, col + dc]);
    }
  }

  private slidingMoves(board: Board, piece: Piece, row: number, col: number, moves: [number, number][], dirs: number[][]): void {
    for (const [dr, dc] of dirs) {
      let r = row + dr, c = col + dc;
      while (this.exists(r, c)) {
        if (board[r][c] === null) { moves.push([r, c]); }
        else { if (this.isEnemy(board, piece, r, c)) moves.push([r, c]); break; }
        r += dr; c += dc;
      }
    }
  }

  private knightMoves(board: Board, piece: Piece, row: number, col: number, moves: [number, number][]): void {
    for (const [dr, dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) {
      const r = row + dr, c = col + dc;
      if (this.exists(r, c) && (board[r][c] === null || this.isEnemy(board, piece, r, c)))
        moves.push([r, c]);
    }
  }

  private kingMoves(board: Board, piece: Piece, row: number, col: number, moves: [number, number][]): void {
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const r = row + dr, c = col + dc;
      if (this.exists(r, c) && (board[r][c] === null || this.isEnemy(board, piece, r, c)))
        moves.push([r, c]);
    }
  }

  private exists(r: number, c: number): boolean {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  private isEnemy(board: Board, piece: Piece, r: number, c: number): boolean {
    return board[r][c] !== null && board[r][c]?.color !== piece.color;
  }
}
