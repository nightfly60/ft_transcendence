import { Component, input, output } from '@angular/core';
import { GameMode } from '../../chess-mode-select/chess-mode-select.component';

@Component({
  selector: 'app-endgame-overlay',
  standalone: true,
  templateUrl: './endgame-overlay.component.html',
  styleUrl: './endgame-overlay.component.scss',
})
export class EndgameOverlayComponent {
  gameStatus = input.required<string>();
  mode       = input.required<GameMode>();
  myColor    = input<string>('');
  turn       = input.required<string>();

  replay = output<void>();
  quit   = output<void>();
}
