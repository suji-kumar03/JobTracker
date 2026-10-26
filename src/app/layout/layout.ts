import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
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
  selector: 'app-layout',
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
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, OnDestroy {

  private router = inject(Router);
  private jobService = inject(Job);
  private auth = inject(Auth);

  sidebarExpanded = signal(false);
  userName = signal('');
  globalSearch = signal('');
  searchOpen = signal(false);
  isAdmin = signal(false);

  private profileUpdatedHandler = () => {
    this.loadCurrentUser();
  };

  ngOnInit() {
    this.loadCurrentUser();

    window.addEventListener(
      'profileUpdated',
      this.profileUpdatedHandler
    );
  }

  loadCurrentUser() {
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    const loggedInRole = localStorage.getItem('loggedInRole');

    this.isAdmin.set(loggedInRole === 'admin');

    if (!loggedInEmail) {
      this.userName.set('');
      return;
    }

    this.auth.getUsers().subscribe({
      next: users => {
        const user = users.find(
          u => u.email.toLowerCase() === loggedInEmail.toLowerCase()
        );

       
        if (user && user.role === loggedInRole) {
          this.userName.set(user.name);
        } else {
          this.userName.set('');
        }
      },
      error: error => {
        console.error('Failed to load user:', error);
        this.userName.set('');
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

    const applicationsRoute = this.isAdmin()
      ? '/admin/applications'
      : '/applications';

    this.router.navigate(
      [applicationsRoute],
      {
        queryParams: {
          search: null
        }
      }
    );
  }

  searchApplications() {
    const search = this.globalSearch().trim();

    const applicationsRoute = this.isAdmin()
      ? '/admin/applications'
      : '/applications';

    this.router.navigate(
      [applicationsRoute],
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