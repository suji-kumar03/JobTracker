import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Job } from '../services/job';

@Component({
  selector: 'app-layout',

  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,MatFormFieldModule,
    MatInputModule
  ],

  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {

  // Sidebar state
  sidebarExpanded = signal(false);

  // Logged-in user's name
  userName = signal('');
  globalSearch = signal('');
  searchOpen = signal(false);
  

  constructor(
    private router: Router,
    private jobService: Job
  ) {}

  ngOnInit() {

    const savedUsers = localStorage.getItem('users');
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    if (savedUsers && loggedInEmail) {

      const users = JSON.parse(savedUsers);

      const user = users.find(
        (u: any) => u.email === loggedInEmail
      );

      if (user) {
        this.userName.set(user.name);
      }
    }
  }

  // Expand / collapse sidebar
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
    ['/applications'],
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
      ['/applications'],
      {
        queryParams: {
          search: search || null
        }
      }
    );
  }

  logout() {

    localStorage.removeItem('loggedInEmail');

    this.jobService.applications.set([]);

    this.router.navigate(['/login']);
  }
}