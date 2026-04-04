import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-leaderboard-controls',
  imports: [],
  templateUrl: './leaderboard-controls.component.html',
  styleUrl: './leaderboard-controls.component.scss',
})
export class LeaderboardControlsComponent {
  @Output() sortByXP = new EventEmitter<void>();
  @Output() sortByLevel = new EventEmitter<void>();
}
