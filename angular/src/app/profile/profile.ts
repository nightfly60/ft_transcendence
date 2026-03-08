import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  data: any = null;
  id: string = '';

  readonly XP_PER_LEVEL = 1000;

  cells = Array.from({ length: 144 }, (_, i) => ({
    light: (Math.floor(i / 12) + i) % 2 === 0
  }));

  get level(): number        { return Math.floor((this.data?.xp ?? 0) / this.XP_PER_LEVEL); }
  get xpInLevel(): number    { return (this.data?.xp ?? 0) % this.XP_PER_LEVEL; }
  get xpPercent(): number    { return (this.xpInLevel / this.XP_PER_LEVEL) * 100; }

  showAll: boolean = false;

  get visibleAchievements() {
  return this.showAll 
  	? this.data.achievements 
	: this.data.achievements?.slice(0, 3);
  }

  toggleAchievements() {
	this.showAll = !this.showAll;
	this.cdr.markForCheck();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
	public auth: AuthService
  ) {}

  goToEdit() {
	window.location.href = `/profile/edit/${this.data.id}`;
  }

	ngOnInit() {
	this.route.params.subscribe(params => {
		const id = params['id'];
		if (!id) { this.router.navigate(['/404']); return; }
		
	this.id = id;
	this.data = null;
	this.showAll = false;
	
	this.http.get(`/api/profile/${id}`).subscribe({
		next: (data) => { this.data = data; this.cdr.markForCheck(); },
		error: (err) => { this.router.navigate([`/${err.status}`]); this.cdr.markForCheck(); },
	});

	this.cdr.markForCheck();
	});
	}
}
