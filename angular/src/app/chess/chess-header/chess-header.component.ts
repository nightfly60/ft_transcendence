import { Component, input, output } from '@angular/core';
import { GameMode } from '../chess-mode-select/chess-mode-select.component';

@Component({
  selector: 'app-chess-header',
  standalone: true,
  templateUrl: './chess-header.component.html',
  styleUrl: './chess-header.component.scss',
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
