import { Component, output } from '@angular/core';

@Component({
  selector: 'app-game-mode-solo',
  standalone: true,
  templateUrl: './game-mode-solo.component.html',
  styleUrl: './game-mode-solo.component.scss',
})
export class GameModeSoloComponent {
  selected = output<void>();
}
