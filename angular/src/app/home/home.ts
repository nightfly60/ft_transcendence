import { Component } from '@angular/core';
import { LogoComponent } from './logo/logo.component';
import { MenuCardsComponent } from './menu-cards/menu-cards.component';
import { MiniBoardComponent } from './mini-board/mini-board.component';

@Component({
  selector: 'app-home',
  imports: [LogoComponent, MenuCardsComponent, MiniBoardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
