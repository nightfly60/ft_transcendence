import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
	isLoggedIn = signal(!!localStorage.getItem('token'));

	login(token: string): void {
		localStorage.setItem('token', token);
		this.isLoggedIn.set(true);
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
}
