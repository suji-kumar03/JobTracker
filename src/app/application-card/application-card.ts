
import { Component, input, output, signal } from '@angular/core';
import { JobApplication } from '../services/job';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-application-card',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './application-card.html',
  styleUrl: './application-card.css'
})
export class ApplicationCard {
  application = input.required<JobApplication>();

  isAdmin = signal(
    localStorage.getItem('loggedInRole') === 'admin'
  );

  deleteApplication = output<string>();
  editApplication = output<JobApplication>();
  viewApplication = output<JobApplication>();

  delete() {
    this.deleteApplication.emit(
      this.application().applicationCode
    );
  }

  edit() {
    
    if (this.isAdmin()) return;

    const status = this.application().status;

    if (status === 'Selected' || status === 'Rejected') return;

    this.editApplication.emit(this.application());
  }

  view() {
    this.viewApplication.emit(this.application());
  }
}
