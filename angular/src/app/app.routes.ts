import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { Home } from './home/home';
import { ErrorPageComponent } from './error-page/error-page';
import { ProfileComponent } from './profile/profile';
import { LoginPage } from './login-page/login-page';
import { authGuard } from './shared/interceptors/auth-interceptor';
import { ProfileEditComponent } from './profile-edit/profile-edit';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginPage },
  { path: 'game', component: GameComponent, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'profile/edit/:id', component: ProfileEditComponent, canActivate: [authGuard] },

  { path: '404', component: ErrorPageComponent, data: { code: 404 } },
  { path: '403', component: ErrorPageComponent, data: { code: 403 } },
  { path: '500', component: ErrorPageComponent, data: { code: 500 } },
  { path: '**', redirectTo: '/404' },
];
