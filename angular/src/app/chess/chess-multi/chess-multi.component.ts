import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { ChessComponent } from '../chess-board/chess-board.component';

@Component({
  selector: 'app-chess-multi',
  standalone: true,
  imports: [ChessComponent],
  templateUrl: './chess-multi.component.html',
})
export class ChessMultiComponent implements OnInit, OnDestroy {
  gameId  = '';
  myColor = '';
  waiting = false;

  constructor(private socket: SocketService) {}

  ngOnInit() {
    this.socket.findGame();

    this.socket.onWaiting(() => {
      this.waiting = true;
    });

    this.socket.onGameReady(({ gameId, color }) => {
      this.gameId  = gameId;
      this.myColor = color;
      this.waiting = false;
    });
  }

  sendMove(from: string, to: string) {
    if (this.gameId)
      this.socket.sendMove(this.gameId, from, to);
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }
}
