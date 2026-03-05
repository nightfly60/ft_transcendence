// user.component.ts
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  data: any = null;
  error = '';
  username = 'Anonyme';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
	private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
	  const username = this.route.snapshot.paramMap.get('profile');
	  if (username)
		this.username = username;
	else
		this.router.navigate(['/404']);
	console.log(username);
	
    this.http.get(`/api/profile/${username}`).subscribe({
		next: (data) => {
			this.data = data;
			console.log(this.data.elo);
			this.cdr.markForCheck();
		},
		error: (err) => {
			this.router.navigate([`/${err.status}`]);
			this.cdr.markForCheck();
		},
    });
  }
}
