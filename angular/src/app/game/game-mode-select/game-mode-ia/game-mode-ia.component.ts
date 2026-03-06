import { Component, output } from '@angular/core';

@Component({
  selector: 'app-game-mode-ia',
  standalone: true,
  templateUrl: './game-mode-ia.component.html',
  styleUrl: './game-mode-ia.component.scss',
})
export class GameModeIaComponent {
  selected = output<void>();
}
