import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit {
  cells: { light: boolean }[] = [];

  ngOnInit(): void {
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        this.cells.push({ light: (r + c) % 2 === 0 });
      }
    }
  }
}
