import { Component, OnInit, signal, inject } from '@angular/core';
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

  application = signal<JobApplication | undefined>(undefined);

  constructor(
    private jobService: Job,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.jobService
        .getApplicationById(id)
        .subscribe({

          next: (application) => {

            this.application.set(application);

          },

          error: (error) => {

            console.error(
              'Failed to load application:',
              error
            );

          }

        });

    }

  }




  editApplication() {

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
            this.application()!.id
          ]);

        }

      });

    }

  }




  deleteApplication() {

    if (this.application()) {

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

        if (result === true) {

          this.jobService
            .deleteApplication(this.application()!.id)
            .subscribe({

              next: () => {

                console.log(
                  'Application deleted successfully'
                );

                this.jobService
                  .loadApplications()
                  .subscribe({

                    next: (applications) => {

                      this.jobService
                        .applications
                        .set(applications);

                      this.router.navigate([
                        '/applications'
                      ]);

                    }

                  });

              },

              error: (error) => {

                console.error(
                  'Failed to delete application:',
                  error
                );

              }

            });

        }

      });

    }

  }

}