import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
  gameId = 'partie-1';
  user$!: Observable<User>;

  constructor(private socket: SocketService, private http: HttpClient) {}

  ngOnInit() {
    this.user$ = this.http.get<User>('/api/users/2');

    this.socket.joinGame(this.gameId);

    this.socket.onMove(({ from, to }) => {
      console.log(`Adversaire joue : ${from} → ${to}`);
    });
  }

  jouerCoup(from: string, to: string) {
    this.socket.sendMove(this.gameId, from, to);
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }
}
