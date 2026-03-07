import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  onLogin(): void {
    console.log('Login:', this.email);
  }

  onRegister(): void {
    console.log('Register:', this.username, this.email);
  }
}
