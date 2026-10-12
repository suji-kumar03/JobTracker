import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Job } from '../services/job';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
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

  constructor(
  private jobService: Job
) {
  this.loadCurrentUser();
}

 loadCurrentUser() {

  const loggedInEmail = localStorage.getItem('loggedInEmail');
  const savedUsers = localStorage.getItem('users');

  if (!loggedInEmail || !savedUsers) {
    return;
  }

  const users = JSON.parse(savedUsers);

  const currentUser = users.find(
    (user: any) => user.email === loggedInEmail
  );

  if (currentUser) {

  this.userName.set(currentUser.name);

  this.userEmail.set(currentUser.email);

  this.emailNotifications.set(
    currentUser.emailNotifications ?? true
  );

  this.defaultJobType =
    currentUser.defaultJobType ?? 'Full Time';
}
}
  editProfile() {

  this.profileName = this.userName();

  this.editMode.set(true);
}
saveProfile() {

  const loggedInEmail = localStorage.getItem('loggedInEmail');
  const savedUsers = localStorage.getItem('users');

  if (!loggedInEmail || !savedUsers) {
    return;
  }

  const users = JSON.parse(savedUsers);

  const updatedUsers = users.map((user: any) => {

    if (user.email === loggedInEmail) {
      return {
        ...user,
        name: this.profileName
      };
    }

    return user;
  });

  localStorage.setItem(
    'users',
    JSON.stringify(updatedUsers)
  );

  this.userName.set(this.profileName);
  this.editMode.set(false);
}


toggleEmailNotifications() {
  this.emailNotifications.update(value => !value);

  console.log(
    'Email Notifications:',
    this.emailNotifications()
  );
}
toggleDarkMode() {
  this.darkMode.update(value => !value);

  console.log(
    'Dark Mode:',
    this.darkMode()
  );
}
saveJobType() {

  const loggedInEmail =
    localStorage.getItem('loggedInEmail');

  const savedUsers =
    localStorage.getItem('users');

  if (!loggedInEmail || !savedUsers) {
    return;
  }

  const users = JSON.parse(savedUsers);

  const updatedUsers = users.map((user: any) => {

    if (user.email === loggedInEmail) {

      return {
        ...user,
        defaultJobType: this.defaultJobType
      };

    }

    return user;
  });

  localStorage.setItem(
    'users',
    JSON.stringify(updatedUsers)
  );
  console.log('Updated users:', updatedUsers);

  console.log(
    'Default Job Type:',
    this.defaultJobType
  );
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

  this.jobService.clearApplications();

  console.log('All application data cleared');
}

}