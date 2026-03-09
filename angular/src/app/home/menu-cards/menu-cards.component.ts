import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-home-menu-cards',
	imports: [RouterLink],
	templateUrl: './menu-cards.component.html',
	styleUrl: './menu-cards.component.scss',
})
export class MenuCardsComponent {
	constructor(
		public auth: AuthService
	) {};
}
