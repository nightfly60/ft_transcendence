import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { Home } from './home/home';
import { NotFoundComponent } from './not-found/not-found.component';
import { ChatBox } from './chat-box/chat-box';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: GameComponent },
  { path: 'chat-box', component: ChatBox},
  { path: '**', component: NotFoundComponent },
];
