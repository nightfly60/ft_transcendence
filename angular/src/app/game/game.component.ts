import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit, OnDestroy {
  gameId = 'partie-1';

  constructor(private socket: SocketService) {}

  ngOnInit() {
    this.socket.joinGame(this.gameId);

    this.socket.onMove(({ from, to }) => {
      console.log(`Adversaire joue : ${from} → ${to}`);
      // TODO: mettre à jour l'échiquier ici
    });
  }

  jouerCoup(from: string, to: string) {
    this.socket.sendMove(this.gameId, from, to);
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }
}
