import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-login-modal',
	imports: [FormsModule],
	templateUrl: './login-modal.component.html',
	styleUrl: './login-modal.component.scss',
})
export class LoginModalComponent {
	@Output() closed = new EventEmitter<void>();

	isOpen = false;
	tab: 'login' | 'register' = 'login';
	email = '';
	password = '';
	username = '';

	open(): void {
		this.isOpen = true;
	}

	close(): void {
		this.isOpen = false;
		this.closed.emit();
	}

	onOverlayClick(event: MouseEvent): void {
		if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
		this.close();
		}
	}

	constructor(private http: HttpClient) {}

	onLogin(): void {
		this.http.post('/api/auth/login', {
			email: this.email,
			password: this.password,
		}).subscribe({
			next: (res) => console.log("reponse: ", res),
			error: (err) => console.log("ERROR ", err)
		});
	}

	onRegister(): void {
		this.http.post('/api/auth/register', {
			username: this.username,
			password: this.password,
			email: this.email
		}).subscribe({
			next: (res) => console.log("reponse: ", res),
			error: (err) => console.log("ERROR ", err)
		});
	}

}
