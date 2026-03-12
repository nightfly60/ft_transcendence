import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { GameState, SocketService } from '../../services/socket.service';
import { ChessComponent } from '../chess-board/chess-board.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chess-solo',
  standalone: true,
  imports: [ChessComponent],
  templateUrl: './chess-solo.component.html',
  styleUrl: './chess-solo.component.scss',
})
export class ChessSoloComponent implements OnInit, OnDestroy {
  private socket = inject(SocketService);
  auth = inject(AuthService);

  gameId    = signal<string>('');
  gameState = signal<GameState | null>(null);
  waiting   = signal<boolean>(true);

  ngOnInit() {
    this.socket.startSolo();

    this.socket.onSoloReady(({ gameId }) => {
      this.gameId.set(gameId);
    });

    this.socket.onGameState(state => {
      this.gameState.set(state);
      this.waiting.set(false);
    });
  }

  onMovePlayed(move: { from: string; to: string; promotion?: string }) {
    const id = this.gameId();
    if (id) this.socket.sendSoloMove(id, move.from, move.to, move.promotion);
  }

  onResign() {
    this.waiting.set(true);
    this.gameState.set(null);
    this.socket.startSolo();
  }

  ngOnDestroy() {
    this.socket.offSoloListeners();
  }
}
