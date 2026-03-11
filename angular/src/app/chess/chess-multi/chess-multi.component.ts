import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { GameState, SocketService } from '../../services/socket.service';
import { ChessComponent } from '../chess-board/chess-board.component';

@Component({
  selector: 'app-chess-multi',
  standalone: true,
  imports: [ChessComponent],
  templateUrl: './chess-multi.component.html',
  styles: [`
    .opponent-banner {
      width: 100%;
      padding: 8px 16px;
      text-align: center;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      border: 1px solid rgba(224, 80, 80, 0.4);
      background: rgba(224, 80, 80, 0.08);
      color: #e05050;
      box-sizing: border-box;
    }
  `],
})
export class ChessMultiComponent implements OnInit, OnDestroy {
  private socket = inject(SocketService);

  gameId    = signal<string>('');
  myColor   = signal<string>('');
  gameState = signal<GameState | null>(null);
  waiting   = signal<boolean>(false);
  countdown = signal<number | null>(null);

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.socket.onWaiting(() => {
      this.waiting.set(true);
    });

    this.socket.onGameReady(({ gameId, color }) => {
      this.gameId.set(gameId);
      this.myColor.set(color);
      this.waiting.set(false);
    });

    this.socket.onOpponentLeft(({ seconds }) => {
      this.countdown.set(seconds);
      this.countdownInterval = setInterval(() => {
        const current = this.countdown();
        if (current === null || current <= 1) {
          clearInterval(this.countdownInterval!);
          this.countdownInterval = null;
          this.countdown.set(null);
        } else {
          this.countdown.set(current - 1);
        }
      }, 1000);
    });

    this.socket.onOpponentBack(() => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      this.countdown.set(null);
    });

    this.socket.onGameState(state => {
      this.gameState.set(state);
      if (state.gameStatus === 'checkmate' || state.gameStatus === 'stalemate') {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.countdown.set(null);
      }
    });

    this.socket.findGame();
  }

  onMovePlayed(move: { from: string; to: string; promotion?: string }) {
    const id = this.gameId();
    if (id) this.socket.sendMove(id, move.from, move.to, move.promotion);
  }

  onResign() {
    const id = this.gameId();
    if (id) this.socket.resignMulti(id);
    this.waiting.set(true);
    this.gameState.set(null);
    this.gameId.set('');
    this.myColor.set('');
    this.socket.findGame();
  }

  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.socket.leaveGame(this.gameId());
    this.socket.offMultiListeners();
  }
}
