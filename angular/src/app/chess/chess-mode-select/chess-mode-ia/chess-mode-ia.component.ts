import { Component, output } from '@angular/core';

@Component({
  selector: 'app-chess-mode-ia',
  standalone: true,
  templateUrl: './chess-mode-ia.component.html',
  styleUrl: './chess-mode-ia.component.scss',
})
export class GameModeIaComponent {
  selected = output<void>();
}
