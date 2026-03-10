import { Component, input, output, signal } from '@angular/core';
import { GameMode } from '../chess-mode-select/chess-mode-select.component';
import { Board, Piece, PieceColor, SYMBOLS, initBoard } from './chess.types';
import { PlayerPanelComponent } from './player-panel/player-panel.component';
import { BoardGridComponent } from './board-grid/board-grid.component';
import { MoveHistoryComponent } from './move-history/move-history.component';

@Component({
  selector: 'app-chess',
  standalone: true,
  imports: [PlayerPanelComponent, BoardGridComponent, MoveHistoryComponent],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss',
})
export class ChessComponent {
  gameId  = input.required<string>();
  mode    = input.required<GameMode>();
  myColor = input<string>('');
  movePlayed = output<{ from: string; to: string }>();

  readonly files = ['a','b','c','d','e','f','g','h'];

  gameStatus = signal<'playing' | 'check' | 'checkmate' | 'stalemate'>('playing');

  checkSquare(): [number, number] | null {
    if (this.gameStatus() !== 'check' && this.gameStatus() !== 'checkmate') return null;
    const board = this.board();
    const color = this.turn();
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c]?.type === 'K' && board[r][c]?.color === color)
          return [r, c];
    return null;
  }

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
    if (this.gameStatus() === 'checkmate' || this.gameStatus() === 'stalemate') return;
    const { r, c } = event;
    const board = this.board();
    const sel = this.selected();

    const isValid = this.validMoves().some(([moveRow, moveCol]) => moveRow === r && moveCol === c);
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

  private toAlgebraic(r: number, c: number): string {
    return `${this.files[c]}${8 - r}`;
  }

  private playMove(fromR: number, fromC: number, toR: number, toC: number): void {
    const board = this.board().map(row => [...row]);
    const piece = board[fromR][fromC]!;
    const target = board[toR][toC];

    if (target)
      this.captured.update(captured => [...captured, target]);

    board[toR][toC] = (piece.type === 'P' && (toR === 0 || toR === 7))
      ? { type: 'Q', color: piece.color }
      : piece;
    board[fromR][fromC] = null;

    const from = this.toAlgebraic(fromR, fromC);
    const to   = this.toAlgebraic(toR, toC);

    this.moveHistory.update(h => [...h, `${from}-${to}`]);
    this.lastMove.set([[fromR, fromC], [toR, toC]]);
    this.board.set(board);

    const nextTurn: PieceColor = piece.color === 'w' ? 'b' : 'w';
    this.turn.set(nextTurn);
    this.selected.set(null);
    this.validMoves.set([]);

    this.updateGameStatus(board, nextTurn);
    this.movePlayed.emit({ from, to });
  }

  resetGame(): void {
    this.board.set(initBoard());
    this.selected.set(null);
    this.validMoves.set([]);
    this.turn.set('w');
    this.moveHistory.set([]);
    this.lastMove.set(null);
    this.captured.set([]);
    this.gameStatus.set('playing');
  }

  private getValidMoves(board: Board, row: number, col: number): [number, number][] {
    const piece = board[row][col];
    if (!piece) return [];
    const raw = this.getRawMoves(board, row, col);
    return raw.filter(([tr, tc]) => !this.leavesKingInCheck(board, row, col, tr, tc, piece.color));
  }

  private getRawMoves(board: Board, row: number, col: number): [number, number][] {
    const piece = board[row][col];
    if (!piece) return [];
    switch (piece.type) {
      case 'P': return this.pawnMoves(board, piece, row, col);
      case 'R': return this.rookMoves(board, piece, row, col);
      case 'B': return this.bishopMoves(board, piece, row, col);
      case 'Q': return this.queenMoves(board, piece, row, col);
      case 'N': return this.knightMoves(board, piece, row, col);
      case 'K': return this.kingMoves(board, piece, row, col);
    }
  }

  private leavesKingInCheck(board: Board, fromR: number, fromC: number, toR: number, toC: number, color: PieceColor): boolean {
    const sim = board.map(row => [...row]);
    sim[toR][toC] = sim[fromR][fromC];
    sim[fromR][fromC] = null;
    return this.isKingInCheck(sim, color);
  }

  private isKingInCheck(board: Board, color: PieceColor): boolean {
    let kingR = -1, kingC = -1;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c]?.type === 'K' && board[r][c]?.color === color)
          { kingR = r; kingC = c; }

    const enemy: PieceColor = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c]?.color === enemy)
          if (this.getRawMoves(board, r, c).some(([ar, ac]) => ar === kingR && ac === kingC))
            return true;
    return false;
  }

  private hasLegalMoves(board: Board, color: PieceColor): boolean {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c]?.color === color && this.getValidMoves(board, r, c).length > 0)
          return true;
    return false;
  }

  private updateGameStatus(board: Board, color: PieceColor): void {
    const inCheck  = this.isKingInCheck(board, color);
    const hasLegal = this.hasLegalMoves(board, color);
    if (!hasLegal && inCheck)  
      this.gameStatus.set('checkmate');
    else if (!hasLegal)        
      this.gameStatus.set('stalemate');
    else if (inCheck)         
       this.gameStatus.set('check');
    else                       
      this.gameStatus.set('playing');
  }

  private pawnMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
    const moves: [number, number][] = [];
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
    return moves;
  }

  private rookMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
    return this.sliding(board, piece, row, col, [[0,1],[0,-1],[1,0],[-1,0]]);
  }

  private bishopMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
    return this.sliding(board, piece, row, col, [[1,1],[1,-1],[-1,1],[-1,-1]]);
  }

  private queenMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
    return this.sliding(board, piece, row, col, [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
  }

  private sliding(board: Board, piece: Piece, row: number, col: number, dirs: number[][]): [number, number][] {
    const moves: [number, number][] = [];
    for (const [dr, dc] of dirs) {
      let r = row + dr, c = col + dc;
      while (this.exists(r, c)) {
        if (board[r][c] === null)
          moves.push([r, c]);
        else {
          if (this.isEnemy(board, piece, r, c))
            moves.push([r, c]);
          break;
        }
        r += dr; c += dc;
      }
    }
    return moves;
  }

  private knightMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
    const moves: [number, number][] = [];
    for (const [dr, dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) {
      const r = row + dr, c = col + dc;
      if (this.exists(r, c) && (board[r][c] === null || this.isEnemy(board, piece, r, c)))
        moves.push([r, c]);
    }
    return moves;
  }

  private kingMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
    const moves: [number, number][] = [];
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const r = row + dr, c = col + dc;
      if (this.exists(r, c) && (board[r][c] === null || this.isEnemy(board, piece, r, c)))
        moves.push([r, c]);
    }
    return moves;
  }

  private exists(r: number, c: number): boolean {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  private isEnemy(board: Board, piece: Piece, r: number, c: number): boolean {
    return board[r][c] !== null && board[r][c]?.color !== piece.color;
  }
}
