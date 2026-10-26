interface AdminApplication {
  id: string;
  userEmail: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedDate: string;
}


import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './admin-dashboard.html'
})

export class AdminDashboard {
  private http = inject(HttpClient);

  totalUsers = signal(0);
  totalApplications = signal(0);
  applied = signal(0);
  interview = signal(0);
  selected = signal(0);
  rejected = signal(0);

  recentApplications = signal<AdminApplication[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor() {
    this.loadDashboard();
  }

  loadDashboard() {
    forkJoin({
      users: this.http.get<any[]>('http://localhost:3000/users'),
      applications: this.http.get<AdminApplication[]>(
        'http://localhost:3000/applications'
      )
    }).subscribe({
      next: ({ users, applications }) => {
        this.totalUsers.set(
          users.filter(user => user.role === 'user').length
        );

        this.totalApplications.set(applications.length);

        this.applied.set(
          applications.filter(app => app.status === 'Applied').length
        );

        this.interview.set(
          applications.filter(app => app.status === 'Interview').length
        );

        this.selected.set(
          applications.filter(app => app.status === 'Selected').length
        );

        this.rejected.set(
          applications.filter(app => app.status === 'Rejected').length
        );

        this.recentApplications.set(
          [...applications]
            .sort((a, b) =>
              b.appliedDate.localeCompare(a.appliedDate)
            )
            .slice(0, 5)
        );

        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Unable to load dashboard. Check whether JSON Server is running.'
        );
        this.isLoading.set(false);
      }
    });
  }
}
