import { Component, output } from '@angular/core';

@Component({
  selector: 'app-chess-mode-multi',
  standalone: true,
  templateUrl: './chess-mode-multi.component.html',
  styleUrl: './chess-mode-multi.component.scss',
})
export class GameModeMultiComponent {
  selected = output<void>();
}
