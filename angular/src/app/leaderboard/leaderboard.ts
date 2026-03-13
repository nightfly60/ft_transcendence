import { Component, ChangeDetectorRef } from '@angular/core';
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

	data: any = null;

	get getLeaderboard() {
		return this.data;
	}

	ngOnInit() {
		this.http.get('/api/leaderboard/index', {}).subscribe({
			next: (data: any) => {
				this.data = data;

				for (var i = 0; this.data[i]; ++i)
					this.data[i].xp = this.data[i].xp / 1000
				this.cd.detectChanges();
			},
			error: (err) => {
				console.log("ERROR", err);
			}
		})
	}

	sortByXP(): any {
		function compare( a: any, b: any ) {
			if ( a.xp < b.xp ){
				return 1;
			}
			if ( a.xp > b.xp ){
				return -1;
			}
			return 0;
		}

		this.data.sort(compare);
		this.cd.detectChanges();
	}

	sortByLevel(): any {
		function compare( a: any, b: any ) {
			if ( a.elo < b.elo ){
				return 1;
			}
			if ( a.elo > b.elo ){
				return -1;
			}
			return 0;
		}

		this.data.sort(compare);
		this.cd.detectChanges();
	}

	openPlayerProfile(id: number): void {
		window.location.href = `/profile/${id}`;
	}
}
