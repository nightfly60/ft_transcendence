import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-leaderboard-search',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './leaderboard-search.component.html',
  styleUrl: './leaderboard-search.component.scss',
})
export class LeaderboardSearchComponent {
  @Input() searchQuery = '';
  @Output() searchChange = new EventEmitter<string>();

  onInput() {
    this.searchChange.emit(this.searchQuery);
  }
}
