import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { GameState, SocketService } from '../../services/socket.service';
import { ChessComponent } from '../chess-board/chess-board.component';

@Component({
  selector: 'app-chess-multi',
  standalone: true,
  imports: [ChessComponent],
  templateUrl: './chess-multi.component.html',
})
export class ChessMultiComponent implements OnInit, OnDestroy {
  private socket = inject(SocketService);

  gameId    = signal<string>('');
  myColor   = signal<string>('');
  gameState = signal<GameState | null>(null);
  waiting   = signal<boolean>(false);

  ngOnInit() {
    this.socket.findGame();

    this.socket.onWaiting(() => {
      this.waiting.set(true);
    });

    this.socket.onGameReady(({ gameId, color }) => {
      this.gameId.set(gameId);
      this.myColor.set(color);
      this.waiting.set(false);
    });

    this.socket.onGameState(state => {
      this.gameState.set(state);
    });
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
    this.socket.offMultiListeners();
  }
}
