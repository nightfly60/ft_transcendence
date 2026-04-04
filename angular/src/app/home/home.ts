import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from './logo/logo.component';
import { MenuCardsComponent } from './menu-cards/menu-cards.component';
import { MiniBoardComponent } from './mini-board/mini-board.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LogoComponent, MenuCardsComponent, MiniBoardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  cells: { light: boolean }[] = [];

  constructor(
	private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        this.cells.push({ light: (r + c) % 2 === 0 });
      }
    }

	this.http.get('/api/home').subscribe();
  }
}
