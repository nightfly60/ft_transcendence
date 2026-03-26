import { Component, OnInit, OnDestroy, inject, output, signal } from '@angular/core';
import { GameState, SocketService } from '../../services/socket.service';
import { ChessComponent } from '../chess-board/chess-board.component';

@Component({
  selector: 'app-chess-multi',
  standalone: true,
  imports: [ChessComponent],
  templateUrl: './chess-multi.component.html',
  styles: [`
    .draw-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 8px 16px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      letter-spacing: 0.1em;
      border: 1px solid rgba(201, 168, 76, 0.4);
      background: rgba(201, 168, 76, 0.08);
      color: #c9a84c;
      box-sizing: border-box;
    }
    .draw-accept, .draw-refuse {
      padding: 0.3rem 1rem;
      border-radius: 4px;
      border: 1px solid;
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
      cursor: pointer;
    }
    .draw-accept { background: #b58863; color: #fff; border-color: #b58863; }
    .draw-accept:hover { background: #a07050; }
    .draw-refuse { background: transparent; color: #aaa; border-color: rgba(170,170,170,0.4); }
    .draw-refuse:hover { background: rgba(170,170,170,0.1); }
    .draw-refused-banner {
      padding: 6px 16px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.9rem;
      letter-spacing: 0.1em;
      color: #e05050;
      text-align: center;
      border: 1px solid rgba(224,80,80,0.3);
      background: rgba(224,80,80,0.06);
      box-sizing: border-box;
    }

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
  quit = output<void>();

  gameId        = signal<string>('');
  myColor       = signal<string>('');
  gameState     = signal<GameState | null>(null);
  waiting       = signal<boolean>(false);
  countdown     = signal<number | null>(null);
  whiteUsername  = signal<string>('');
  blackUsername  = signal<string>('');
  drawProposed   = signal<boolean>(false);
  drawRefused    = signal<boolean>(false);

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.socket.onWaiting(() => {
      this.waiting.set(true);
    });

    this.socket.onGameReady(({ gameId, color, whiteUsername, blackUsername, conversationId }) => {
      this.gameId.set(gameId);
      this.myColor.set(color);
      this.whiteUsername.set(whiteUsername);
      this.blackUsername.set(blackUsername);
      this.waiting.set(false);
      console.log("Multi game ready");
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
      if (!this.gameId()) return;
      this.gameState.set(state);
      if (state.gameStatus === 'checkmate' || state.gameStatus === 'stalemate' || state.gameStatus === 'resign') {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.countdown.set(null);
        this.socket.leaveGame(this.gameId());
      }
    });

    this.socket.onDrawProposed(() => {
      this.drawProposed.set(true);
    });

    this.socket.onDrawRefused(() => {
      this.drawRefused.set(true);
      setTimeout(() => this.drawRefused.set(false), 3000);
    });

    this.socket.findGame();
  }

  onProposeDraw() {
    this.socket.proposeDraw(this.gameId());
  }

  onAcceptDraw() {
    this.drawProposed.set(false);
    this.socket.acceptDraw(this.gameId());
  }

  onRefuseDraw() {
    this.drawProposed.set(false);
    this.socket.refuseDraw(this.gameId());
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

  onAbandon() {
    const id = this.gameId();
    if (id) this.socket.resignMulti(id);
    // Le serveur renverra game_state checkmate → la popup s'affichera
  }

  onReplay() {
    this.gameState.set(null);
    this.gameId.set('');
    this.myColor.set('');
    this.waiting.set(true);
    this.socket.findGame();
  }

  onQuit() {
    this.socket.offMultiListeners();
    this.quit.emit();
  }

  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.socket.leaveGame(this.gameId());
    this.socket.offMultiListeners();
  }
}
