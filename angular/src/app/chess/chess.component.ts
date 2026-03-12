import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { GameModeSelectComponent, GameMode } from './chess-mode-select/chess-mode-select.component';
import { GameHeaderComponent } from './chess-header/chess-header.component';
import { ChessSoloComponent } from './chess-solo/chess-solo.component';
import { ChessMultiComponent } from './chess-multi/chess-multi.component';
import { ChessIaComponent } from './chess-ia/chess-ia.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [AsyncPipe, GameModeSelectComponent, GameHeaderComponent, ChessSoloComponent, ChessMultiComponent, ChessIaComponent],
  templateUrl: './chess.component.html',
  styleUrl: './chess.component.scss',
})
export class GameComponent implements OnInit {
  user$!: Observable<User>;
  selectedMode: GameMode | null = null;
  selectedIaLevel: any = null;
  cells: { light: boolean }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    for (let r = 0; r < 12; r++)
      for (let c = 0; c < 12; c++)
        this.cells.push({ light: (r + c) % 2 === 0 });

    this.user$ = this.http.get<User>('/api/users/2');
  }

  selectMode(event: { mode: GameMode; iaLevel?: any}) {
    this.selectedMode = event.mode;
	this.selectedIaLevel = event.iaLevel ?? null;
  }

  goBack() {
    this.selectedMode = null;
  }
}
