import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { Home } from './home/home';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: GameComponent }, 
  { path: '**', component: NotFoundComponent },
 
];
