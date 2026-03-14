import { Component, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { LeaderboardBackgroundComponent } from './leaderboard-background/leaderboard-background.component';
import { LeaderboardSearchComponent } from './leaderboard-search/leaderboard-search.component';
import { LeaderboardControlsComponent } from './leaderboard-controls/leaderboard-controls.component';
import { LeaderboardCardComponent } from './leaderboard-card/leaderboard-card.component';

@Component({
  selector: 'app-leaderboard',
  imports: [
    CommonModule,
    MatPaginatorModule,
    LeaderboardBackgroundComponent,
    LeaderboardSearchComponent,
    LeaderboardControlsComponent,
    LeaderboardCardComponent,
  ],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss',
})
export class Leaderboard implements AfterViewInit {
  constructor(private http: HttpClient, public auth: AuthService, private cd: ChangeDetectorRef) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  data: any[] = [];
  searchQuery = '';
  pageSize = 5;
  pageIndex = 0;

  get filteredData(): any[] {
    if (!this.searchQuery.trim()) return this.data;
    const q = this.searchQuery.trim().toLowerCase();
    return this.data.filter(p => p.username.toLowerCase().includes(q));
  }

  get pagedData(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  ngAfterViewInit() {}

  ngOnInit() {
    this.http.get('/api/leaderboard/index', {}).subscribe({
      next: (data: any) => {
        this.data = data;
        for (var i = 0; this.data[i]; ++i)
          this.data[i].xp = this.data[i].xp / 1000;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.log("ERROR", err);
      }
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.cd.detectChanges();
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  sortByXP(): any {
    this.data.sort((a, b) => b.xp - a.xp);
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.cd.detectChanges();
  }

  sortByLevel(): any {
    this.data.sort((a, b) => b.elo - a.elo);
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.cd.detectChanges();
  }

  openPlayerProfile(id: number): void {
    window.location.href = `/profile/${id}`;
  }
}
