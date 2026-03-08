import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-profile-edit',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './profile-edit.html',
	styleUrls: ['./profile-edit.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditComponent implements OnInit {

	@ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

	data: any = null;
	id: string = '';

	username: string = '';
	bio: string = '';
	previewUrl: string | null = null;
	selectedFile: File | null = null;

	saving: boolean = false;

	cells = Array.from({ length: 144 }, (_, i) => ({
		light: (Math.floor(i / 12) + i) % 2 === 0
	}));

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		public auth: AuthService,
	) {}

	ngOnInit() {
		this.route.params.subscribe(params => {
		const id = params['id'];
		if (!id) { this.router.navigate(['/404']); return; }
		if (String(id) !== String(this.auth.getUserId()))
		{
			this.router.navigate(['/']);
			return ;
		}

		this.id = id;

		this.http.get(`/api/profile/${id}`).subscribe({
			next: (data: any) => {
			this.data = data;
			this.username = data.username ?? '';
			this.bio = data.bio ?? '';
			this.cdr.markForCheck();
			},
			error: (err) => {
			this.router.navigate([`/${err.status}`]);
			}
		});
		});
	}

  triggerFileInput() {
	this.fileInput.nativeElement.click();
  }

	onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		const file = input.files[0];
		this.selectedFile = file;

		const reader = new FileReader();
		reader.onload = () => {
		this.previewUrl = reader.result as string;
		this.cdr.markForCheck();
		};
		reader.readAsDataURL(file);
	}

	save() {
		this.saving = true;
		this.cdr.markForCheck();
		this.http.patch<{ token: string }>(`/api/profile-edit/${this.id}`, {
			username: this.username.trim(),
			bio: this.bio?.trim() || null,
		}).subscribe({
			next: (patchRes: any) => {
			if (patchRes.token)
				this.auth.login(patchRes.token);
			if (this.selectedFile) {
				const formData = new FormData();
				formData.append('avatar', this.selectedFile);
				this.http.post(`/api/profile-edit/avatar/${this.id}`, formData).subscribe({
				next: (postRes: any) => {
					if (postRes.token)
					this.auth.login(postRes.token);
					this.saving = false;
					this.goBack();
				},
				error: (err) => {
					this.saving = false;
					console.error('Erreur sauvegarde', err);
					this.cdr.markForCheck();
				}
				});
			} else {
				this.saving = false;
				this.goBack();
				this.cdr.markForCheck();
			}
			},
			error: (err) => {
			this.saving = false;
			console.log('Erreur de sauvegarde');
			this.cdr.markForCheck();
			}
		});
	}

	goBack() {
		window.location.href = `/profile/${this.id}`;
	}
}
