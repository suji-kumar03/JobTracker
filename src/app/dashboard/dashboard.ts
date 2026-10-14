import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,inject
} from '@angular/core';
import { Job,JobApplication } from '../services/job';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit, OnDestroy {

  
 private job=inject(Job);
 private http = inject(HttpClient);
  userName = signal('User');

applications=this.job.applications;
apiApplications = signal<JobApplication[]>([]);


recentApplications = computed(() => {
  return this.applications()
    .slice(-5)
    .reverse();
});

  totalApplications = computed(() => {
    return this.applications().length;
  });

  appliedCount = computed(() => {
    return this.applications()
      .filter(app => app.status === 'Applied')
      .length;
  });

  interviewCount = computed(() => {
    return this.applications()
      .filter(app => app.status === 'Interview')
      .length;
  });

  selectedCount = computed(() => {
    return this.applications()
      .filter(app => app.status === 'Selected')
      .length;
  });

  rejectedCount = computed(() => {
    return this.applications()
      .filter(app => app.status === 'Rejected')
      .length;
  });



  constructor() {

    effect(() => {

      console.log(
        'Total applications:',
        this.totalApplications()
      );

    });

  }

  
  ngOnInit() {

  console.log('Dashboard initialized');

  
  const savedUser = localStorage.getItem('user');

  if (savedUser) {

    const user = JSON.parse(savedUser);

    this.userName.set(user.name);

  }
  this.job
  .loadApplications()
  .subscribe();

  

}


 

  ngOnDestroy() {

    console.log('Dashboard destroyed');

  }



}