import { Component, output } from '@angular/core';

@Component({
  selector: 'app-chess-mode-solo',
  standalone: true,
  templateUrl: './chess-mode-solo.component.html',
  styleUrl: './chess-mode-solo.component.scss',
})
export class GameModeSoloComponent {
  selected = output<void>();
}
