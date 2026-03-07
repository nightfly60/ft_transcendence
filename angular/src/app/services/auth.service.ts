import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
	constructor(private router: Router) {}

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

	handleTokenFromUrl() {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (token) {
		localStorage.setItem('token', token);
		window.location.href = '/';
		}
	}
}
