import { Component } from '@angular/core';
import { ChessComponent } from '../chess-board/chess-board.component';

@Component({
  selector: 'app-chess-solo',
  standalone: true,
  imports: [ChessComponent],
  templateUrl: './chess-solo.component.html',
})
export class ChessSoloComponent {}
