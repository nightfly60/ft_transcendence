import { Component, output } from '@angular/core';
import { GameModeSoloComponent } from './chess-mode-solo/chess-mode-solo.component';
import { GameModeMultiComponent } from './chess-mode-multi/chess-mode-multi.component';
import { GameModeIaComponent } from './chess-mode-ia/chess-mode-ia.component';

export type GameMode = 'solo' | 'multi' | 'ia';

@Component({
  selector: 'app-chess-mode-select',
  standalone: true,
  imports: [GameModeSoloComponent, GameModeMultiComponent, GameModeIaComponent],
  templateUrl: './chess-mode-select.component.html',
  styleUrl: './chess-mode-select.component.scss',
})
export class GameModeSelectComponent {
  modeSelected = output<GameMode>();

  select(mode: GameMode) {
    this.modeSelected.emit(mode);
  }
}
