import { Component, effect, input, output, signal } from '@angular/core';
import { GameMode } from '../chess-mode-select/chess-mode-select.component';
import { Board, Piece, PieceColor, PieceType, SYMBOLS, initBoard } from './chess.types';
import { PlayerPanelComponent } from './player-panel/player-panel.component';
import { BoardGridComponent } from './board-grid/board-grid.component';
import { MoveHistoryComponent } from './move-history/move-history.component';

type PromotionPiece = Extract<PieceType, 'Q' | 'R' | 'B' | 'N'>;

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
  movePlayed = output<{ from: string; to: string; promotion?: string }>();
  resign     = output<void>();

  externalBoard      = input<Board | null>(null);
  externalTurn       = input<PieceColor | null>(null);
  externalStatus     = input<'playing' | 'check' | 'checkmate' | 'stalemate' | null>(null);
  externalHistory    = input<string[] | null>(null);
  externalCaptured   = input<Piece[] | null>(null);
  externalLastMove   = input<[[number, number], [number, number]] | null>(null);
  externalValidMoves = input<Record<string, string[]> | null>(null);

  readonly files = ['a','b','c','d','e','f','g','h'];

  gameStatus  = signal<'playing' | 'check' | 'checkmate' | 'stalemate'>('playing');
  board       = signal<Board>(initBoard());
  selected    = signal<[number, number] | null>(null);
  validMoves  = signal<[number, number][]>([]);
  turn        = signal<PieceColor>('w');
  moveHistory = signal<string[]>([]);
  lastMove    = signal<[[number,number],[number,number]] | null>(null);
  captured    = signal<Piece[]>([]);

  showPromotion    = signal<boolean>(false);
  pendingPromotion = signal<{ from: [number,number]; to: [number,number] } | null>(null);
  readonly promotionPieces: PromotionPiece[] = ['Q', 'R', 'B', 'N'];

  manualFlip   = signal<boolean>(false);
  showEndgame  = signal<boolean>(false);
  isFlipped() { return this.myColor() === 'b' || this.manualFlip(); }

  constructor() {
    effect(() => {
      const eb = this.externalBoard();
      if (eb === null) return;
      this.board.set(eb);
      const et = this.externalTurn();
      if (et) this.turn.set(et);
      const es = this.externalStatus();
      if (es) {
        const wasOver = this.gameStatus() === 'checkmate' || this.gameStatus() === 'stalemate';
        this.gameStatus.set(es);
        if (!wasOver && (es === 'checkmate' || es === 'stalemate')) {
          this.showEndgame.set(true);
          setTimeout(() => this.showEndgame.set(false), 4000);
        }
      }
      const eh = this.externalHistory();
      if (eh) this.moveHistory.set(eh);
      const ec = this.externalCaptured();
      if (ec) this.captured.set(ec);
      this.lastMove.set(this.externalLastMove());
      this.selected.set(null);
      this.validMoves.set([]);
    });
  }

  // ─── Display helpers ──────────────────────────────────────────────────────

  checkSquare(): [number, number] | null {
    if (this.gameStatus() !== 'check' && this.gameStatus() !== 'checkmate') return null;
    const color = this.turn();
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (this.board()[r][c]?.type === 'K' && this.board()[r][c]?.color === color)
          return [r, c];
    return null;
  }

  movePairs(): { n: number; w: string; b: string }[] {
    const h = this.moveHistory();
    const pairs: { n: number; w: string; b: string }[] = [];
    for (let i = 0; i < h.length; i += 2)
      pairs.push({ n: Math.floor(i / 2) + 1, w: h[i], b: h[i + 1] ?? '' });
    return pairs;
  }

  capturedSymbols(color: PieceColor): string {
    return this.captured()
      .filter(p => p.color === color)
      .map(p => SYMBOLS[p.color][p.type])
      .join('');
  }

  promotionSymbol(p: PromotionPiece): string {
    const pending = this.pendingPromotion();
    const color = pending
      ? (this.board()[pending.from[0]][pending.from[1]]?.color ?? 'w')
      : 'w';
    return SYMBOLS[color][p];
  }

  resetGame(): void {
    this.resign.emit();
    this.selected.set(null);
    this.validMoves.set([]);
    this.showPromotion.set(false);
    this.pendingPromotion.set(null);
  }

  // ─── Interaction ──────────────────────────────────────────────────────────

  onSquareClick(event: { r: number; c: number }): void {
    if (this.gameStatus() === 'checkmate' || this.gameStatus() === 'stalemate') return;
    if (this.showPromotion()) return;
    const color = this.myColor();
    if (this.mode() === 'multi' && color && this.turn() !== color) return;
    const { r, c } = event;
    const sel = this.selected();
    const extMoves = this.externalValidMoves();

    const isValid = this.validMoves().some(([mr, mc]) => mr === r && mc === c);
    if (sel && isValid) {
      const fromPiece = this.board()[sel[0]][sel[1]];
      if (fromPiece?.type === 'P' && (r === 0 || r === 7)) {
        this.pendingPromotion.set({ from: sel, to: [r, c] });
        this.showPromotion.set(true);
        this.selected.set(null);
        this.validMoves.set([]);
      } else {
        this.selected.set(null);
        this.validMoves.set([]);
        this.movePlayed.emit({
          from: this.toAlgebraic(sel[0], sel[1]),
          to:   this.toAlgebraic(r, c),
        });
      }
      return;
    }

    if (extMoves) {
      const sqKey = this.toAlgebraic(r, c);
      const targets = extMoves[sqKey];
      if (targets?.length) {
        this.selected.set([r, c]);
        this.validMoves.set(targets.map(sq => this.fromAlgebraic(sq)));
        return;
      }
    }

    this.selected.set(null);
    this.validMoves.set([]);
  }

  selectPromotion(piece: PromotionPiece): void {
    const pending = this.pendingPromotion();
    if (!pending) return;
    this.movePlayed.emit({
      from:      this.toAlgebraic(pending.from[0], pending.from[1]),
      to:        this.toAlgebraic(pending.to[0],   pending.to[1]),
      promotion: piece,
    });
    this.showPromotion.set(false);
    this.pendingPromotion.set(null);
  }

  // ─── Coordinate helpers ───────────────────────────────────────────────────

  private toAlgebraic(r: number, c: number): string {
    return `${this.files[c]}${8 - r}`;
  }

  private fromAlgebraic(sq: string): [number, number] {
    return [8 - parseInt(sq[1]), this.files.indexOf(sq[0])];
  }
}
