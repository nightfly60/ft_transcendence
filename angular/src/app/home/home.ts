import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from './logo/logo.component';
import { MenuCardsComponent } from './menu-cards/menu-cards.component';
import { MiniBoardComponent } from './mini-board/mini-board.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LogoComponent, MenuCardsComponent, MiniBoardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  cells: { light: boolean }[] = [];

  ngOnInit(): void {
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        this.cells.push({ light: (r + c) % 2 === 0 });
      }
    }
  }
}
