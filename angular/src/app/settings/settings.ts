import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
	qrcodeDataUrl = '';
	TempSecret = '';
	token = '';

	tokenErrorEnable = '';
	tokenErrorConfirm = '';

	constructor(private http: HttpClient, private router: Router, public auth: AuthService, private cd: ChangeDetectorRef) {}

	cells = Array.from({ length: 144 }, (_, i) => ({
		light: (Math.floor(i / 12) + i) % 2 === 0
	}));

	enable2fa() : void {
		this.tokenErrorEnable = '';

		if (!this.auth.isLoggedIn)
			return ;

		this.http.post<{ qrDataUrl: string, secret: string }>('/api/2fa/enable', {}).subscribe({
			next: (res) => {
				this.qrcodeDataUrl = res.qrDataUrl;
				this.TempSecret = res.secret;
				this.cd.detectChanges();
			},
			error: (err) => {
				console.log("ERROR", err);
				const msg: string = err.error?.error ?? 'Erreur serveur';
				this.tokenErrorEnable = msg;
				this.cd.detectChanges();
			}
		});
	}

	confirm2fa() : void {
		this.tokenErrorConfirm = '';

		if (!this.auth.isLoggedIn)
			return ;

		this.http.post('/api/2fa/confirm', {
			token: this.token,
			secret: this.TempSecret,
		}).subscribe({
			next: (res) => {
				this.cd.detectChanges();
				window.location.reload();
			},
			error: (err) => {
				console.log("ERROR", err);
				const msg: string = err.error?.error ?? 'Erreur serveur';
				this.tokenErrorConfirm = msg;
				this.cd.detectChanges();
			}
		});
	}
}
