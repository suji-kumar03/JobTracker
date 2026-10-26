import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Job } from '../services/job';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './admin-layout.html'
})
export class AdminLayout implements OnInit, OnDestroy {

  private router = inject(Router);
  private jobService = inject(Job);
  private auth = inject(Auth);

  sidebarExpanded = signal(false);
  userName = signal('');
  globalSearch = signal('');
  searchOpen = signal(false);

  private profileUpdatedHandler = () => {
    this.loadCurrentAdmin();
  };

  ngOnInit() {
    this.loadCurrentAdmin();

    window.addEventListener(
      'profileUpdated',
      this.profileUpdatedHandler
    );
  }

  loadCurrentAdmin() {
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    if (!loggedInEmail) {
      this.userName.set('');
      return;
    }

    this.auth.getUsers().subscribe({
      next: users => {
        const admin = users.find(
          user =>
            user.email.toLowerCase() === loggedInEmail.toLowerCase() &&
            user.role === 'admin'
        );

        this.userName.set(admin?.name ?? 'Admin');
      },
      error: error => {
        console.error('Failed to load admin:', error);
        this.userName.set('Admin');
      }
    });
  }

  toggleSidebar() {
    this.sidebarExpanded.update(
      expanded => !expanded
    );
  }

  collapseSidebar() {
    this.sidebarExpanded.set(false);
  }

  toggleSearch() {
    this.searchOpen.update(
      open => !open
    );
  }

  closeSearch() {
    this.searchOpen.set(false);
    this.globalSearch.set('');

    this.router.navigate(
      ['/admin/applications'],
      {
        queryParams: {
          search: null
        }
      }
    );
  }

  searchApplications() {
    const search = this.globalSearch().trim();

    this.router.navigate(
      ['/admin/applications'],
      {
        queryParams: {
          search: search || null
        }
      }
    );
  }

  logout() {
    localStorage.removeItem('loggedInEmail');
    localStorage.removeItem('loggedInUserCode');
    localStorage.removeItem('loggedInRole');

    this.jobService.clearApplications();

    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    window.removeEventListener(
      'profileUpdated',
      this.profileUpdatedHandler
    );
  }
}