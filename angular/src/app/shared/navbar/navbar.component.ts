import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
	@Output() loginRequested = new EventEmitter<void>();
	isLoggedIn = false;
	menuOpen = false;

	constructor(private router: Router, public auth: AuthService) {
		this.isLoggedIn = this.auth.isLoggedIn();
		const token = localStorage.getItem('token');
		if (token) {
			const payload = JSON.parse(atob(token.split('.')[1]));
		}
	}

	toggleMenu(): void {
		this.menuOpen = !this.menuOpen;
	}

	openLogin(): void {
		this.router.navigate(['/login']);
	}

	logout(): void {
		this.auth.logout();
		this.isLoggedIn = false;
		this.router.navigate(['/login']);
	}
}
