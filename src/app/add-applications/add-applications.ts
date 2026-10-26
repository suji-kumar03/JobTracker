import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Job, JobApplication } from '../services/job';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { Auth } from '../services/auth';
@Component({
  selector: 'app-add-applications',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './add-applications.html',
  styleUrl: './add-applications.css',
})
export class AddApplications implements OnInit {

  jobForm = new FormGroup({
    jobTitle: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    company: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    jobType: new FormControl('', [
      Validators.required
    ]),
    status: new FormControl('Applied', [
      Validators.required
    ]),
    appliedDate: new FormControl<Date | null>(null, [
      Validators.required
    ]),
    location: new FormControl('', [
      Validators.maxLength(50)
    ]),
    description: new FormControl('', [
      Validators.maxLength(150)
    ]),
    requirements: new FormControl('', [
      Validators.maxLength(150)
    ]),
    isRemote: new FormControl(false),



  });

  today = new Date().toISOString().split('T')[0];

  editId = signal<string | null>(null);

  private originalFormValue: string | null = null;
  private auth = inject(Auth);
  private originalApplication: JobApplication | null = null;

  constructor(
    private jobService: Job,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,

  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.jobService.getApplicationByCode(id).subscribe({
        next: (application) => {
          this.originalApplication = application;
          this.editId.set(application.id);

          this.jobForm.patchValue({
            jobTitle: application.jobTitle,
            company: application.company,
            jobType: application.jobType,
            status: application.status,
            appliedDate: new Date(application.appliedDate),
            location: application.location,
            description: application.description,
            requirements: application.requirements,
            isRemote: application.isRemote
          });


          this.originalFormValue = this.getFormSnapshot();


          if (
            application.status === 'Selected' ||
            application.status === 'Rejected'
          ) {
            this.jobForm.get('status')?.disable();
          }

        },
        error: (error) => {
          console.error('Failed to load application:', error);
        }
      });

      return;
    }

    this.loadDefaultJobType();
  }

  private getFormSnapshot(): string {
    const value = this.jobForm.getRawValue();
    const date = value.appliedDate;

    const normalizedDate = date instanceof Date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : date;

    return JSON.stringify({
      ...value,
      appliedDate: normalizedDate
    });
  }

  
loadDefaultJobType() {
  const loggedInEmail = localStorage.getItem('loggedInEmail');

  if (!loggedInEmail) {
    return;
  }

  this.auth.getUsers().subscribe({
    next: users => {
      const currentUser = users.find(
        user => user.email.toLowerCase() === loggedInEmail.toLowerCase()
      );

      if (currentUser?.defaultJobType) {
        this.jobForm.patchValue({
          jobType: currentUser.defaultJobType
        });
      }
    },
    error: error => {
      console.error('Failed to load default job type:', error);
    }
  });
}


  saveApplication() {
    this.jobForm.markAllAsTouched();

    if (this.jobForm.invalid) {
      return;
    }


    if (this.editId()) {
      if (
        this.originalFormValue !== null &&
        this.originalFormValue === this.getFormSnapshot()
      ) {
        this.snackBar.open(
          'No changes detected.',
          'Close',
          { duration: 3000 }
        );

        return;
      }
    }

    const formValue = this.jobForm.getRawValue();
    const date = formValue.appliedDate;

    const formattedDate = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;

    const application = {
      jobTitle: formValue.jobTitle!,
      company: formValue.company!,
      jobType: formValue.jobType!,
      status: formValue.status!,
      appliedDate: formattedDate!,
      location: formValue.location ?? '',
      description: formValue.description ?? '',
      requirements: formValue.requirements ?? '',
      isRemote: formValue.isRemote ?? false

    };


    if (this.editId()) {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '380px',
        maxWidth: '90vw',
        panelClass: 'jobtrack-dialog',
        data: {
          title: 'Update Application',
          message: 'Are you sure you want to update this application?',
          confirmText: 'Update'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          const updatedApplication: JobApplication = {
            ...this.originalApplication!,
            ...application,
            id: this.originalApplication!.id,
            applicationCode: this.originalApplication!.applicationCode,
            userEmail: this.originalApplication!.userEmail
          };

          this.jobService.updateApplication(updatedApplication).subscribe({
            next: () => {
              this.snackBar.open(
                'Application updated successfully.',
                'Close',
                { duration: 3000 }
              );

              this.jobService.loadApplications().subscribe({
                next: applications => {
                  this.jobService.applications.set(applications);
                  this.router.navigate(['/applications']);
                }
              });
            },
            error: error => {
              console.error('Failed to update application:', error);
            }
          });
        }
      });

      return;
    }


    this.jobService.addApplication(application).subscribe({
      next: () => {
        this.jobService.loadApplications().subscribe({
          next: applications => {
            this.jobService.applications.set(applications);
            this.router.navigate(['/applications']);
          }
        });
      },
      error: error => {
        console.error('Failed to add application:', error);
      }
    });
  }
}
