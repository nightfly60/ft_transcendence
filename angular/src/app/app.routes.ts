import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { Home } from './home/home';
import { ErrorPageComponent } from './error-page/error-page';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: GameComponent },
  { path: 'profile/:id', component: ProfileComponent },

  { path: '404', component: ErrorPageComponent, data: { code: 404 } },
  { path: '403', component: ErrorPageComponent, data: { code: 403 } },
  { path: '500', component: ErrorPageComponent, data: { code: 500 } },
  { path: '**', redirectTo: '/404' },
];
