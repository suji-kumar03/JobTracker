import { Component, input, output } from '@angular/core';
import { JobApplication } from '../services/job';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-application-card',
  standalone: true,
  imports: [ MatIconModule,
    MatTooltipModule],
  templateUrl: './application-card.html',
  styleUrl: './application-card.css'
})
export class ApplicationCard {


  application = input.required<JobApplication>();

  
  deleteApplication = output<string>();

  editApplication = output<JobApplication>();
  viewApplication = output<JobApplication>();


  delete() {
  console.log('CHILD DELETE ID:', this.application().id);

  this.deleteApplication.emit(
    this.application().id
  );
}


  edit() {
    this.editApplication.emit(
      this.application()
    );
  }
  view() {
  this.viewApplication.emit(this.application());
}

}