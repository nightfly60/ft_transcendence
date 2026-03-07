import { Component, input, output } from '@angular/core';
import { GameMode } from '../game-mode-select/game-mode-select.component';

@Component({
  selector: 'app-game-header',
  standalone: true,
  templateUrl: './game-header.component.html',
  styleUrl: './game-header.component.scss',
})
export class GameHeaderComponent {
  mode = input.required<GameMode>();
  username = input<string>('');
  back = output<void>();

  readonly labels: Record<GameMode, string> = {
    solo: 'Solo',
    multi: 'Multijoueur',
    ia: 'Vs IA',
  };
}
