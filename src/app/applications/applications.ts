import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Job, JobApplication } from '../services/job';
import { ApplicationCard } from '../application-card/application-card';
import { Router,ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
  ApplicationCard,
  FormsModule,
  DatePipe,
  MatDialogModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatIconModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatTooltipModule,
  MatExpansionModule,
  MatButtonModule
],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {

  jobService = inject(Job);
  router = inject(Router);
  dialog = inject(MatDialog);
  route = inject(ActivatedRoute);
  private http = inject(HttpClient);

isAdmin = signal(false);
adminApplications = signal<JobApplication[]>([]);
adminLoading = signal(false);
adminError = signal('');

applications = computed(() =>
  this.isAdmin()
    ? this.adminApplications()
    : this.jobService.applications()
);

  

  dataSource = new MatTableDataSource<JobApplication>([]);
  pageIndex = 0;
pageSize = 6;

  sort!: MatSort;
paginator!: MatPaginator;

@ViewChild(MatSort)
set matSort(sort: MatSort) {
  this.sort = sort;
  this.dataSource.sort = sort;
}

@ViewChild(MatPaginator)
set matPaginator(paginator: MatPaginator) {
  this.paginator = paginator;
  this.dataSource.paginator = paginator;
}
onPageChange(event: PageEvent): void {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
}

  
  draftJobTitle = signal('');
  draftCompany = signal('');
  draftStatus = signal('All Status');
  draftType = signal('All Types');

  
  searchText = signal('');
  selectedStatus = signal('All Status');
  selectedType = signal('All Types');
    
  appliedJobTitle = signal('');
  appliedCompany = signal('');

  
  applySearch() {
    this.searchText.set('');

    this.appliedJobTitle.set(this.draftJobTitle().trim().toLowerCase());
    this.appliedCompany.set(this.draftCompany().trim().toLowerCase());

    this.selectedStatus.set(this.draftStatus());
    this.selectedType.set(this.draftType());

   
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

 
  clearSearch() {
    this.draftJobTitle.set('');
    this.draftCompany.set('');
    this.draftStatus.set('All Status');
    this.draftType.set('All Types');

    this.appliedJobTitle.set('');
    this.appliedCompany.set('');

    this.searchText.set('');
    this.selectedStatus.set('All Status');
    this.selectedType.set('All Types');

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }



  

  constructor() {
  effect(() => {

  this.dataSource.data = this.filteredApplications();

});

 

  this.route.queryParams.subscribe(params => {

    const search = params['search'] || '';

    this.searchText.set(search);

  });
}
loadApplications(): void {
  if (this.isAdmin()) {
    this.adminLoading.set(true);
    this.adminError.set('');

    this.http
      .get<JobApplication[]>('http://localhost:3000/applications')
      .subscribe({
        next: (applications) => {
          this.adminApplications.set(applications);
          this.adminLoading.set(false);
        },
        error: () => {
          this.adminError.set(
            'Unable to load applications. Check whether JSON Server is running.'
          );
          this.adminLoading.set(false);
        }
      });
  } else {
    this.jobService.loadApplications().subscribe();
  }
}


ngOnInit(): void {
  const role = localStorage.getItem('loggedInRole');

  this.isAdmin.set(role === 'admin');

  this.displayedColumns = this.isAdmin()
    ? [
        'number',
        'jobTitle',
        'company',
        'userEmail',
        'status',
        'appliedDate',
        'createdOn',
        'modifiedOn',
        'actions'
      ]
    : [
        'number',
        'jobTitle',
        'company',
        'status',
        'appliedDate',
        'createdOn',
        'modifiedOn',
        'actions'
      ];

  this.loadApplications();
}



displayedColumns: string[] = [
  'number',
  'jobTitle',
  'company',
  'status',
  'appliedDate',
  'createdOn',
  'modifiedOn',
  'actions'
];



  
  filteredApplications = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const title = this.appliedJobTitle();
    const company = this.appliedCompany();
    const status = this.selectedStatus();
    const type = this.selectedType();

    return this.applications().filter(app => {
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(search) ||
        app.company.toLowerCase().includes(search);

      const matchesTitle =
        app.jobTitle.toLowerCase().includes(title);

      const matchesCompany =
        app.company.toLowerCase().includes(company);

      const matchesStatus =
        status === 'All Status' || app.status === status;

      const matchesType =
        type === 'All Types' || app.jobType === type;

      return (
        matchesSearch &&
        matchesTitle &&
        matchesCompany &&
        matchesStatus &&
        matchesType
      );
    });
  });


  

 


  
deleteApplication(code: string): void {
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
    if (result !== true) return;

    const apiUrl = 'http://localhost:3000/applications';

    
    if (this.isAdmin()) {
      this.http
        .get<JobApplication[]>(
          `${apiUrl}?applicationCode=${encodeURIComponent(code)}`
        )
        .subscribe({
          next: applications => {
            const application = applications[0];

            if (!application) {
              console.error('Application not found.');
              return;
            }

            
            this.http
              .delete<void>(`${apiUrl}/${application.id}`)
              .subscribe({
                next: () => {
                 
                  this.adminApplications.update(apps =>
                    apps.filter(app => app.applicationCode !== code)
                  );
                  this.loadApplications();
                  console.log('Application deleted successfully.');
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

      return;
    }

    
    this.jobService.deleteApplication(code).subscribe({
      next: () => {
        this.loadApplications();
        console.log('Application deleted successfully.');
      },
      error: error => {
        console.error('Failed to delete application:', error);
      }
    });
  });
}



  
editApplication(application: JobApplication): void {
  this.router.navigate(['/add-applications', application.applicationCode]);
}

  viewApplication(application: JobApplication) {
  this.router.navigate([
    '/application-details',
    application.applicationCode
  ]);
}

}