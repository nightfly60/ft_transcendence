// login-page.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
	tab: 'login' | 'register' = 'login';
	email = '';
	password = '';
	username = '';
	emailError = '';
	passError = '';
	usernameError = '';

	constructor(private http: HttpClient, private router: Router, private auth: AuthService, private cd: ChangeDetectorRef) {}

	onLogin(): void {
		this.passError = '';
		this.emailError = '';

		this.http.post<{ token: string }>('/api/auth/login', {
		email: this.email,
		password: this.password,
		}).subscribe({
			next: (res) => {
				this.auth.login(res.token);
				this.router.navigate(['/']);
			},
			error: (err) => {
				console.log("ERROR", err);
				const msg: string = err.error?.error ?? 'Erreur serveur';
				if (msg.includes('Email'))
					this.emailError = msg;
				else if (msg.includes('Mot de passe'))
					this.passError = msg;
				else
					this.passError = msg;
				this.cd.detectChanges();
			}
		});
	}

	onRegister(): void {
		this.passError = '';
		this.emailError = '';
		this.usernameError = '';

		this.http.post('/api/auth/register', {
			email: this.email,
			password: this.password,
			username: this.username,
		}).subscribe({
			next: () => this.tab = 'login',
			error: (err) => {
				console.log("ERROR", err);
				const msg: string = err.error?.error ?? 'Erreur serveur';
				if (msg.includes('Email'))
					this.emailError = msg;
				else if (msg.includes('Username'))
					this.usernameError = msg;
				else
					this.passError = msg;
				this.cd.detectChanges();
			}
		});
	}
}
