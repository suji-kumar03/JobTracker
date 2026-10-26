
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject
} from '@angular/core';

import { Job, JobApplication } from '../services/job';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface AdminApplication {
  id: string | number;
  userEmail: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedDate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit, OnDestroy {

  private job = inject(Job);
  private http = inject(HttpClient);

  
  isAdmin = signal(false);


  applications = this.job.applications;

  recentApplications = computed(() => {
    return this.applications()
      .slice(-5)
      .reverse();
  });

  totalApplications = computed(() => this.applications().length);

  appliedCount = computed(() =>
    this.applications().filter(app => app.status === 'Applied').length
  );

  interviewCount = computed(() =>
    this.applications().filter(app => app.status === 'Interview').length
  );

  selectedCount = computed(() =>
    this.applications().filter(app => app.status === 'Selected').length
  );

  rejectedCount = computed(() =>
    this.applications().filter(app => app.status === 'Rejected').length
  );

 
  totalUsers = signal(0);
  adminTotalApplications = signal(0);
  adminApplied = signal(0);
  adminInterview = signal(0);
  adminSelected = signal(0);
  adminRejected = signal(0);

  adminRecentApplications = signal<AdminApplication[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const role = localStorage.getItem('loggedInRole');

    this.isAdmin.set(role === 'admin');

    if (role === 'admin') {
      this.loadAdminDashboard();
    } else {
      this.job.loadApplications().subscribe();
    }
  }

  loadAdminDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      users: this.http.get<any[]>(
        'http://localhost:3000/users'
      ),
      applications: this.http.get<AdminApplication[]>(
        'http://localhost:3000/applications'
      )
    }).subscribe({
      next: ({ users, applications }) => {
        
        this.totalUsers.set(
          users.filter(user => user.role === 'user').length
        );

        this.adminTotalApplications.set(applications.length);

        this.adminApplied.set(
          applications.filter(app => app.status === 'Applied').length
        );

        this.adminInterview.set(
          applications.filter(app => app.status === 'Interview').length
        );

        this.adminSelected.set(
          applications.filter(app => app.status === 'Selected').length
        );

        this.adminRejected.set(
          applications.filter(app => app.status === 'Rejected').length
        );

        
        this.adminRecentApplications.set(
          [...applications]
            .sort((a, b) =>
              (b.appliedDate || '').localeCompare(a.appliedDate || '')
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

  ngOnDestroy(): void {
    console.log('Dashboard destroyed');
  }
}
