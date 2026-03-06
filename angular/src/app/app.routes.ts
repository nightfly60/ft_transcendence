import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { Home } from './home/home';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginPage } from './login-page/login-page';
import { authGuard } from './shared/interceptors/auth-interceptor';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginPage },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'game', component: GameComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];
