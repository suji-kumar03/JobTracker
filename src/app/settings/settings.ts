import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Job } from '../services/job';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Auth, User } from '../services/auth';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, MatSlideToggleModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {

  userName = signal('');
  userEmail = signal('');
  editMode = signal(false);
  profileName = '';
  emailNotifications = signal(true);
  darkMode = signal(false);
  defaultJobType = 'Full Time';
  currentUser = signal<User | null>(null);

  constructor(
    private jobService: Job,
    private auth: Auth
  ) {
    this.loadCurrentUser();

    const isDark = localStorage.getItem('darkMode') === 'true';

    this.darkMode.set(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }

  loadCurrentUser() {
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    if (!loggedInEmail) {
      return;
    }

    this.auth.getUsers().subscribe({
      next: users => {
        const user = users.find(
          u => u.email.toLowerCase() === loggedInEmail.toLowerCase()
        );

        if (user) {
          this.currentUser.set(user);
          this.userName.set(user.name);
          this.userEmail.set(user.email);

          this.emailNotifications.set(
            (user as User & { emailNotifications?: boolean })
              .emailNotifications ?? true
          );

          this.defaultJobType = user.defaultJobType ?? 'Full Time';
        }
      },
      error: error => {
        console.error('Failed to load current user:', error);
      }
    });
  }
  editProfile() {

    this.profileName = this.userName();

    this.editMode.set(true);
  }

  saveProfile() {
    const user = this.currentUser();
    const name = this.profileName.trim();

    if (!user || !user.id || !name) {
      console.error('User, user ID, or name is missing.');
      return;
    }

    const updatedUser: User = {
      ...user,
      name: name
    };

    this.auth.updateUser(updatedUser).subscribe({
      next: savedUser => {
        this.currentUser.set(savedUser);
        this.userName.set(savedUser.name);
        this.userEmail.set(savedUser.email);

        this.editMode.set(false);


        window.dispatchEvent(new Event('profileUpdated'));

        console.log('Profile updated successfully:', savedUser);
      },
      error: error => {
        console.error('Failed to update profile:', error);
      }
    });
  }



  toggleEmailNotifications() {
    this.emailNotifications.update(value => !value);

    console.log(
      'Email Notifications:',
      this.emailNotifications()
    );
  }
  toggleDarkMode(isDark: boolean): void {
    this.darkMode.set(isDark);

    document.documentElement.classList.toggle('dark', isDark);

    localStorage.setItem('darkMode', String(isDark));
  }

  saveJobType() {
    const user = this.currentUser();

    if (!user || !user.id) {
      console.error('Current user or user ID is missing.');
      return;
    }

    const updatedUser: User = {
      ...user,
      defaultJobType: this.defaultJobType
    };

    this.auth.updateUser(updatedUser).subscribe({
      next: savedUser => {
        this.currentUser.set(savedUser);
        console.log('Default Job Type updated:', savedUser.defaultJobType);
      },
      error: error => {
        console.error('Failed to update Default Job Type:', error);
      }
    });
  }

  exportData() {

    const applications = this.jobService.applications();

    if (applications.length === 0) {
      console.log('No application data to export');
      return;
    }

    const data = JSON.stringify(
      applications,
      null,
      2
    );

    const blob = new Blob(
      [data],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = 'jobtrack-applications.json';

    link.click();

    URL.revokeObjectURL(url);
  }
  clearData() {

    const confirmed = confirm(
      'Are you sure you want to clear all application data?'
    );

    if (!confirmed) {
      return;
    }

    this.jobService.clearApplications().subscribe({
      next: () => {
        console.log('Application data cleared successfully');
      },
      error: error => {
        console.error('Failed to clear application data:', error);
      }
    });
  }

}