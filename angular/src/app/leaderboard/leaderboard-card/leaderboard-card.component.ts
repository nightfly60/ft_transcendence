import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-leaderboard-card',
  imports: [],
  templateUrl: './leaderboard-card.component.html',
  styleUrl: './leaderboard-card.component.scss',
})
export class LeaderboardCardComponent {
  @Input() player!: { id: number; username: string; xp: number; elo: number };
  @Output() profileOpen = new EventEmitter<number>();
}
