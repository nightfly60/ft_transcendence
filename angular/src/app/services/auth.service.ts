import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
	constructor(private router: Router) {}
	private socket = inject(SocketService);

	isLoggedIn = signal(!!localStorage.getItem('token'));
	username = signal(this.getUsername());

	login(token: string): void {
		localStorage.removeItem('token');
		localStorage.setItem('token', token);
		this.isLoggedIn.set(true);
		this.username.set(this.getUsername());
		this.socket.reconnect(token);
	}

	updateUsername(newUsername: string): void { // mettre a jour quand le username change
		const token = localStorage.getItem('token');
		if (!token) return;
		const payload = JSON.parse(atob(token.split('.')[1]));
		payload.username = newUsername;
		this.username.set(newUsername);
	}

	logout(): void {
		localStorage.removeItem('token');
		this.isLoggedIn.set(false);
	}

	getUsername(): string {
		const token = localStorage.getItem('token');
		if (!token) return '';
		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload.username ?? '';
	}

	getUserId(): string {
		const token = localStorage.getItem('token');
		if (!token) return '';
		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload.id ?? '';
	}

	getAvatarUrl(): string {
		const token = localStorage.getItem('token');
		if (!token) return '/avatars/default-avatar.png';
		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload.path_img ?? '/avatars/default-avatar.png';
	}

	handleTokenFromUrl() {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (token) {
		localStorage.setItem('token', token);
		window.location.href = '/';
		}
	}
}
