import { Component, inject, output } from '@angular/core';
import { GameModeSoloComponent } from './chess-mode-solo/chess-mode-solo.component';
import { GameModeMultiComponent } from './chess-mode-multi/chess-mode-multi.component';
import { GameModeIaComponent } from './chess-mode-ia/chess-mode-ia.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  auth = inject(AuthService);
  router = inject(Router);

  select(mode: GameMode) {
    if ((mode === 'ia' || mode === 'multi') && !this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.modeSelected.emit(mode);
  }
}
