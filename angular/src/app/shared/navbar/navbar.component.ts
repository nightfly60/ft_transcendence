import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Output() loginRequested = new EventEmitter<void>();

  isLoggedIn = false;
  username = '';
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  openLogin(): void {
    this.loginRequested.emit();
  }

  logout(): void {
    this.isLoggedIn = false;
    this.username = '';
  }
}
