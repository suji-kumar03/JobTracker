import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Job, JobApplication } from '../services/job';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-application-details',
  standalone: true,
  imports: [
    RouterLink,
    MatDialogModule
  ],
  templateUrl: './application-details.html',
  styleUrl: './application-details.css'
})
export class ApplicationDetails implements OnInit {
  private http = inject(HttpClient);
private apiUrl = 'http://localhost:3000/applications';

  application = signal<JobApplication | undefined>(undefined);
  isAdmin = signal(localStorage.getItem('loggedInRole') === 'admin');

  canEdit = computed(() =>
    !this.isAdmin() &&
    this.application()?.status !== 'Selected' &&
    this.application()?.status !== 'Rejected'
  );

  canDelete = computed(() => true);

  constructor(
    private jobService: Job,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  const code = this.route.snapshot.paramMap.get('id');

  if (!code) {
    return;
  }

  if (this.isAdmin()) {
    
    this.http.get<JobApplication[]>(this.apiUrl).subscribe({
      next: applications => {
        const found = applications.find(
          app => app.applicationCode === code
        );

        this.application.set(found);
      },
      error: error => {
        console.error('Failed to load application:', error);
      }
    });
  } else {
    
    this.jobService.getApplicationByCode(code).subscribe({
      next: application => {
        this.application.set(application);
      },
      error: error => {
        console.error('Failed to load application:', error);
      }
    });
  }
}




  editApplication() {
    if (!this.canEdit()) {
      return;
    }

    if (this.application()) {

      const dialogRef = this.dialog.open(ConfirmDialog, {

        width: '380px',
        maxWidth: '90vw',
        panelClass: 'jobtrack-dialog',

        data: {
          title: 'Edit Application',
          message: 'Are you sure you want to edit this application?',
          confirmText: 'Edit'
        }

      });


      dialogRef.afterClosed().subscribe(result => {

        if (result === true) {

          this.router.navigate([
            '/add-applications',
            this.application()!.applicationCode
          ]);

        }

      });

    }

  }




  deleteApplication() {
  if (!this.canDelete() || !this.application()) {
    return;
  }

  const app = this.application()!;

  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '380px',
    maxWidth: '90vw',
    panelClass: 'jobtrack-dialog',
    data: {
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application?',
      confirmText: 'Delete'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result !== true) {
      return;
    }

    if (this.isAdmin()) {
      
      this.http.get<JobApplication[]>(
        `${this.apiUrl}?applicationCode=${encodeURIComponent(app.applicationCode)}`
      ).subscribe({
        next: applications => {
          const found = applications[0];

          if (!found) {
            console.error('Application not found.');
            return;
          }

          this.http.delete<void>(
            `${this.apiUrl}/${found.id}`
          ).subscribe({
            next: () => {
              this.router.navigate(['/admin/applications']);
            },
            error: error => {
              console.error('Admin failed to delete application:', error);
            }
          });
        },
        error: error => {
          console.error('Failed to find application:', error);
        }
      });

    } else {
      
      this.jobService.deleteApplication(app.applicationCode).subscribe({
        next: () => {
          this.jobService.loadApplications().subscribe({
            next: applications => {
              this.jobService.applications.set(applications);
              this.router.navigate(['/applications']);
            }
          });
        },
        error: error => {
          console.error('Failed to delete application:', error);
        }
      });
    }
  });
}

}