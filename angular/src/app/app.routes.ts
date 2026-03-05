import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { ErrorPageComponent } from './error-page/error-page';

export const routes: Routes = [
  { path: 'game', component: GameComponent },
  { path: '404', component: ErrorPageComponent, data: { code: 404 } },
  { path: '403', component: ErrorPageComponent, data: { code: 403 } },
  { path: '500', component: ErrorPageComponent, data: { code: 500 } },
  { path: '**', redirectTo: '/404' },
];
