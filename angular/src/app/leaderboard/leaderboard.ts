import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss',
})
export class Leaderboard {
	constructor(private http: HttpClient, private router: Router, public auth: AuthService, private cd: ChangeDetectorRef) {}

	cells = Array.from({ length: 144 }, (_, i) => ({
		light: (Math.floor(i / 12) + i) % 2 === 0
	}));

	ngOnInit() {
		this.getLeaderBoard();
	}

	data: any = null;

	getLeaderBoard(): void {
		this.http.get('/api/leaderboard/index', {}).subscribe({
			next: (data: any) => {
				this.data = data;
				console.log(this.data);
			},
			error: (err) => {
				console.log("ERROR", err);
			}
		})
	}

	openPlayerProfile(id: number): void {
		window.location.href = `/profile/${id}`;
	}

}
