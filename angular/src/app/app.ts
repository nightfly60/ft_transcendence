import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AuthService } from './services/auth.service';
import { ChatWidgetComponent } from './shared/chat-widget/chat-widget.component';
import { NewChat } from './new-chat/new-chat';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ChatWidgetComponent, NewChat],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})

export class App implements OnInit {
	constructor(private authService: AuthService) {}

	ngOnInit() {
		this.authService.handleTokenFromUrl();
	}
}
