import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  username = 'Anonyme';

  readonly XP_PER_LEVEL = 1000;

  cells = Array.from({ length: 144 }, (_, i) => ({
    light: (Math.floor(i / 12) + i) % 2 === 0
  }));

  get level(): number        { return Math.floor((this.data?.xp ?? 0) / this.XP_PER_LEVEL); }
  get xpInLevel(): number    { return (this.data?.xp ?? 0) % this.XP_PER_LEVEL; }
  get xpPercent(): number    { return (this.xpInLevel / this.XP_PER_LEVEL) * 100; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('profile');
    if (username) this.username = username;
    else this.router.navigate(['/404']);

    this.http.get(`/api/profile/${username}`).subscribe({
      next: (data) => { this.data = data; this.cdr.markForCheck(); },
      error: (err)  => { this.router.navigate([`/${err.status}`]); this.cdr.markForCheck(); },
    });
  }
}
