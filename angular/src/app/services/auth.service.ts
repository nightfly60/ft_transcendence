import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
	isLoggedIn = signal(!!localStorage.getItem('token'));
	username = signal(this.getUsername());

	login(token: string): void {
		localStorage.removeItem('token');
		localStorage.setItem('token', token);
		this.isLoggedIn.set(true);
		this.username.set(this.getUsername())
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
}
