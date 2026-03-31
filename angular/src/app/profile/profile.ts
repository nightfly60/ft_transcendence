import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, effect, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-user',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './profile.html',
	styleUrls: ['./profile.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
	data: any = null;
	id: string = '';
	isFriend: boolean = false;
	isOnline: boolean = false;
	private targetId = signal<number>(0);
	private routeSub: Subscription | null = null;

	private socket = inject(SocketService);

	readonly XP_PER_LEVEL = 1000;
	cells = Array.from({ length: 144 }, (_, i) => ({
		light: (Math.floor(i / 12) + i) % 2 === 0
	}));

	get level(): number     { return Math.floor((this.data?.xp ?? 0) / this.XP_PER_LEVEL); }
	get xpInLevel(): number { return (this.data?.xp ?? 0) % this.XP_PER_LEVEL; }
	get xpPercent(): number { return (this.xpInLevel / this.XP_PER_LEVEL) * 100; }

	showAll: boolean = false;
	get visibleAchievements() {
		return this.showAll
		? this.data.achievements
		: this.data.achievements?.slice(0, 3);
	}

	get visibleGames() {
		return this.data.games
	}

	toggleAchievements() {
		this.showAll = !this.showAll;
		this.cdr.markForCheck();
	}

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		public auth: AuthService
	) {
		effect(() => {
			const id = this.targetId();
			const online = id === Number(this.auth.getUserId()) || this.socket.isUserOnline(id);
			if (this.isOnline !== online) {
				this.isOnline = online;
				this.cdr.markForCheck();
			}
		});
	}

	goToEdit() {
		window.location.href = `/profile/edit/${this.data.id}`;
	}

	ngOnInit() {
		this.routeSub = this.route.params.subscribe(params => {
		const id = params['id'];
		if (!id) { this.router.navigate(['/404']); return; }
		this.id = id;
		this.data = null;
		this.showAll = false;
		this.isFriend = false;

			this.http.get(`/api/profile/${id}`).subscribe({
				next: (data: any) => {
					this.data = data;
					if (this.auth.getUserId() !== data.id) {
						this.checkFriendStatus(data.id);
					}
					this.targetId.set(data.id);
					this.cdr.markForCheck();
				},
				error: (err) => { this.router.navigate([`/${err.status}`]); this.cdr.markForCheck(); },
			});
		});
	}

	checkFriendStatus(targetId: number) {
			if (!this.auth.isLoggedIn()) return ;
			this.http.get<{isFriend: boolean}>(`/api/friends/status/${targetId}`).subscribe({
				next: (res) => { this.isFriend = res.isFriend; this.cdr.markForCheck(); },
				error: () => {}
			});
		}

	startPolling(targetId: number) {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
			this.pollingInterval = null;
		}
		if (!this.auth.isLoggedIn()) return;
		this.checkOnlineStatus(targetId);
		this.pollingInterval = setInterval(() => {
			this.checkOnlineStatus(targetId);
		}, 1000 * 30);
	}

	ngOnDestroy() {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
			this.pollingInterval = null;
		}
		this.routeSub?.unsubscribe();
	}

	checkOnlineStatus(targetId: number) {
		if (!this.auth.isLoggedIn()) return ;
		this.http.get<{ isOnline: boolean }>(`/api/friends/online/${targetId}`).subscribe({
			next: (res) => {
				this.isOnline = res.isOnline;
				this.cdr.markForCheck();
			},
			error: () => {}
		});
	}

	toggleFriend() {
		if (!this.data) return;

		if (this.isFriend)
		{
			this.http.delete(`/api/friends/remove/${this.data.id}`).subscribe({
				next: () => {
				this.isFriend = false;
				this.cdr.markForCheck();
				},
				error: () => {}
			});
		}
		else
		{
			this.http.post(`/api/friends/add/${this.data.id}`, {}).subscribe({
				next: () => {
				this.isFriend = true;
				this.cdr.markForCheck();
				},
				error: () => {}
			});
		}
	}

	goToFriends() {
		this.router.navigate(['/profile', this.data.id, 'friends']);
	}

	startConversation() {
		this.router.navigate(['/direct-messages'], {
			queryParams: { userId: this.data.id } 
		});
	}
}
