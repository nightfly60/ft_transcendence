import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard-background',
  imports: [CommonModule],
  templateUrl: './leaderboard-background.component.html',
  styleUrl: './leaderboard-background.component.scss',
})
export class LeaderboardBackgroundComponent {
  cells = Array.from({ length: 144 }, (_, i) => ({
    light: (Math.floor(i / 12) + i) % 2 === 0,
  }));
}
