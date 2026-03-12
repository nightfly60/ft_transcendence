import { Component, OnInit, inject } from '@angular/core';
import { GameModeSelectComponent, GameMode } from './chess-mode-select/chess-mode-select.component';
import { GameHeaderComponent } from './chess-header/chess-header.component';
import { ChessSoloComponent } from './chess-solo/chess-solo.component';
import { ChessMultiComponent } from './chess-multi/chess-multi.component';
import { AuthService } from '../services/auth.service';
import { ChessIaComponent } from './chess-ia/chess-ia.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [GameModeSelectComponent, GameHeaderComponent, ChessSoloComponent, ChessMultiComponent, ChessIaComponent],
  templateUrl: './chess.component.html',
  styleUrl: './chess.component.scss',
})
export class GameComponent implements OnInit {
  selectedMode: GameMode | null = null;
  cells: { light: boolean }[] = [];
  auth = inject(AuthService);

  ngOnInit() {
    for (let r = 0; r < 12; r++)
      for (let c = 0; c < 12; c++)
        this.cells.push({ light: (r + c) % 2 === 0 });
  }

  selectMode(mode: GameMode) {
    this.selectedMode = mode;
  }

  goBack() {
    this.selectedMode = null;
  }
}
