import { Component, output } from '@angular/core';

@Component({
  selector: 'app-game-mode-multi',
  standalone: true,
  templateUrl: './game-mode-multi.component.html',
  styleUrl: './game-mode-multi.component.scss',
})
export class GameModeMultiComponent {
  selected = output<void>();
}
