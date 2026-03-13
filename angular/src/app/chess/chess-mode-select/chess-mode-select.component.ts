import { Component, inject, output } from '@angular/core';
import { GameModeSoloComponent } from './chess-mode-solo/chess-mode-solo.component';
import { GameModeMultiComponent } from './chess-mode-multi/chess-mode-multi.component';
import { GameModeIaComponent } from './chess-mode-ia/chess-mode-ia.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { IaLevel } from './ia-level-modal/ia-level-modal';
import { IaLevelModal } from './ia-level-modal/ia-level-modal';

export type GameMode = 'solo' | 'multi' | 'ia';

@Component({
  selector: 'app-chess-mode-select',
  standalone: true,
  imports: [GameModeSoloComponent, GameModeMultiComponent, GameModeIaComponent, IaLevelModal],
  templateUrl: './chess-mode-select.component.html',
  styleUrl: './chess-mode-select.component.scss',
})
export class GameModeSelectComponent {
	modeSelected = output<{mode: GameMode; iaLevel?: IaLevel}>();
	showIaModal = false;

	select(mode: GameMode) {
		this.modeSelected.emit({mode});
	}

	onIaLevelSelected(level: IaLevel) {
		this.showIaModal = false;
		this.modeSelected.emit({ mode: 'ia', iaLevel: level });
	}
}
