import { Component, input, output } from '@angular/core';
import { GameMode } from '../game-mode-select/game-mode-select.component';

@Component({
  selector: 'app-game-board',
  standalone: true,
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoardComponent {
  gameId = input.required<string>();
  mode = input.required<GameMode>();
  movePlayed = output<{ from: string; to: string }>();

  play(from: string, to: string) {
    this.movePlayed.emit({ from, to });
  }
}
