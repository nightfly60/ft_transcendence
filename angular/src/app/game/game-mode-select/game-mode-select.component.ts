import { Component, output } from '@angular/core';
import { GameModeSoloComponent } from './game-mode-solo/game-mode-solo.component';
import { GameModeMultiComponent } from './game-mode-multi/game-mode-multi.component';
import { GameModeIaComponent } from './game-mode-ia/game-mode-ia.component';

export type GameMode = 'solo' | 'multi' | 'ia';

@Component({
  selector: 'app-game-mode-select',
  standalone: true,
  imports: [GameModeSoloComponent, GameModeMultiComponent, GameModeIaComponent],
  templateUrl: './game-mode-select.component.html',
  styleUrl: './game-mode-select.component.scss',
})
export class GameModeSelectComponent {
  modeSelected = output<GameMode>();

  select(mode: GameMode) {
    this.modeSelected.emit(mode);
  }
}
