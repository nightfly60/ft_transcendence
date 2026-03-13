import { Routes } from '@angular/router';
import { GameComponent } from './chess/chess.component';
import { ChatBox } from './chat-box/chat-box';
import { Home } from './home/home';
import { ErrorPageComponent } from './error-page/error-page';
import { ProfileComponent } from './profile/profile';
import { LoginPage } from './login-page/login-page';
import { authGuard } from './shared/interceptors/auth-interceptor';
import { ProfileEditComponent } from './profile-edit/profile-edit';
import { PrivacyComponent } from './privacy/privacy';
import { TermsComponent } from './terms/terms';
import { Settings } from './settings/settings';
import { Leaderboard } from './leaderboard/leaderboard';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'login', component: LoginPage },
	{ path: 'game', component: GameComponent },
  { path: 'chat-box', component: ChatBox},
	{ path: 'profile/:id', component: ProfileComponent, canActivate: [authGuard] },
	{ path: 'profile/edit/:id', component: ProfileEditComponent, canActivate: [authGuard] },
	{ path: 'policies/privacy-policy', component: PrivacyComponent },
	{ path: 'policies/terms-of-use', component: TermsComponent },
	{ path: 'settings', component: Settings, canActivate: [authGuard]},
	{ path: 'leaderboard', component: Leaderboard, canActivate: [authGuard]},

	{ path: '404', component: ErrorPageComponent, data: { code: 404 } },
	{ path: '403', component: ErrorPageComponent, data: { code: 403 } },
	{ path: '500', component: ErrorPageComponent, data: { code: 500 } },
	{ path: '**', redirectTo: '/404' },
];
