import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocketService } from '../services/socket.service';
import { User } from '../models/user.model';
import { GameModeSelectComponent, GameMode } from './chess-mode-select/chess-mode-select.component';
import { GameHeaderComponent } from './chess-header/chess-header.component';
import { ChessComponent } from './chess-board/chess-board.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [AsyncPipe, GameModeSelectComponent, GameHeaderComponent, ChessComponent],
  templateUrl: './chess.component.html',
  styleUrl: './chess.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
  gameId = 'partie-1';
  user$!: Observable<User>;
  selectedMode: GameMode | null = null;
  cells: { light: boolean }[] = [];

  constructor(private socket: SocketService, private http: HttpClient) {}

  ngOnInit() {
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        this.cells.push({ light: (r + c) % 2 === 0 });
      }
    }
    this.user$ = this.http.get<User>('/api/users/2');
    this.socket.joinGame(this.gameId);
    this.socket.onMove(({ from, to }) => {
      console.log(`Adversaire joue : ${from} → ${to}`);
    });
  }

  selectMode(mode: GameMode) {
    this.selectedMode = mode;
  }

  goBack() {
    this.selectedMode = null;
  }

  jouerCoup(from: string, to: string) {
    if (this.selectedMode !== 'solo') {
      this.socket.sendMove(this.gameId, from, to);
    }
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }
}
