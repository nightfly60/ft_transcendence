import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
	constructor(private router: Router) {}
	private socket = inject(SocketService);

	isLoggedIn = signal(!!localStorage.getItem('token'));
	username = signal(this.getUsername());

	/*fonction pour decoder le UTF-8 (les accents)*/
	private decodeToken(token: string): any {
		try
		{
			const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
			const res = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
			return JSON.parse(res);
		}
		catch
		{
			return null;
		}
	}

	login(token: string): void {
		localStorage.removeItem('token');
		localStorage.setItem('token', token);
		this.isLoggedIn.set(true);
		this.username.set(this.getUsername());
		this.socket.reconnect(token);
	}

	updateUsername(newUsername: string): void { // mettre a jour quand le username change
		this.username.set(newUsername);
	}

	logout(): void {
		localStorage.removeItem('token');
		this.isLoggedIn.set(false);
	}

	getUsername(): string {
		const token = localStorage.getItem('token');
		if (!token) return '';
		const payload = this.decodeToken(token);
		return payload?.username ?? '';
	}

	getUserId(): string {
		const token = localStorage.getItem('token');
		if (!token) return '';
		const payload = this.decodeToken(token);
		return payload.id ?? '';
	}

	getUserMail(): string {
		const token = localStorage.getItem('token');
		if (!token) return '';
		const payload = this.decodeToken(token);
		return payload?.email ?? '';
	}

	getAvatarUrl(): string {
		const token = localStorage.getItem('token');
		if (!token) return '/avatars/default-avatar.png';
		const payload = this.decodeToken(token);
		return payload?.path_img ?? '/avatars/default-avatar.png';
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
