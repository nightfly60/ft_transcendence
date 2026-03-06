import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './error-page.html',
  styleUrls: ['./error-page.scss'],
})

export class ErrorPageComponent implements OnInit {
  cells: { light: boolean }[] = [];
  code: number = 404;
  citation = '';

  errors: { [key: number]: { titre : string } } = {
	404 : { titre: 'La page est introuvable'},
	403 : { titre: 'Vous n’avez pas la permission d’accéder à cette page'},
	500 : { titre: 'Erreur interne du serveur'},
  };

  constructor(private route: ActivatedRoute) {}

  // liste des citations pour page erreur 404
  citations = [
	'« La seule façon d\'échouer pour moi, c\'est de ne pas essayer. » <br> - Garry Kasparov (ancien champion du monde)',
	'« On apprend parfois plus d\'une défaite que d\'une victoire. » <br> - José Raúl Capablanca ("The Human Chess Machine")',
	'« Les gaffes sont là, sur l\'échiquier, attendant d\'être commises. » <br> - Xavier Tartakover',
	'« Un mauvais plan est toujours meilleur qu\'une absence de plan. » <br> - Mikhail Tchigorine',
  ];

  ngOnInit(): void {

	// damier
	for (let r = 0; r < 12; r++) {
	  for (let c = 0; c < 12; c++) {
		this.cells.push({ light: (r + c) % 2 === 0 });
	  }
	}

	this.code = this.route.snapshot.data['code'] ?? 404;

	// recuperer une citation au hasard
	const index = Math.floor(Math.random() * this.citations.length);
	this.citation = this.citations[index];
  }
}
