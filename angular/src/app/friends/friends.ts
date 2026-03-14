import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friends.html',
  styleUrls: ['./friends.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FriendsComponent implements OnInit {

	friends: any[] = [];
	username: string = '';
	id: string = '';
	loading: boolean = true;

	cells = Array.from({ length: 144 }, (_, i) => ({
		light: (Math.floor(i / 12) + i) % 2 === 0
	}));

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		public auth: AuthService,
	) {}

	ngOnInit() {
		this.route.params.subscribe(params => {
		const id = params['id'];
		if (!id) { this.router.navigate(['/404']); return; }
		this.id = id;

		this.http.get<any>(`/api/profile/${id}`).subscribe({
			next: (data) => {
			this.username = data.username ?? '';
			this.cdr.markForCheck();
			},
			error: (err) => this.router.navigate([`/${err.status}`])
		});

		this.http.get<any[]>(`/api/friends/list/${id}`).subscribe({
			next: (friends) => {
			this.friends = friends;
			this.loading = false;
			this.cdr.markForCheck();
			},
			error: (err) => {
			this.loading = false;
			this.router.navigate([`/${err.status}`]);
			this.cdr.markForCheck();
			}
		});
		});
	}

	goToProfile(friendId: number) {
		this.router.navigate(['/profile', friendId]);
	}

	goBack() {
		this.router.navigate(['/profile', this.id]);
	}
}
