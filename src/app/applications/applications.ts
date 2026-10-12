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
  MatPaginatorModule
} from '@angular/material/paginator';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  map, filter
} from 'rxjs';
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
@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [ApplicationCard, FormsModule, MatDialogModule, MatTableModule,
    MatPaginatorModule, MatSortModule,MatIconModule, MatFormFieldModule, MatSelectModule, MatInputModule,MatTooltipModule],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {

  jobService = inject(Job);
  router = inject(Router);
  dialog = inject(MatDialog);
  route = inject(ActivatedRoute);

  applications = this.jobService.applications;

  dataSource = new MatTableDataSource<JobApplication>([]);

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

  // Filter values
  searchText = signal('');
  searchSubject = new Subject<string>();
  searchOpen = signal(false);
  selectedStatus = signal('All Status');
  selectedType = signal('All Types');

  toggleSearch() {

  this.searchOpen.update(open => !open);

  if (this.searchOpen() === false) {
    this.searchText.set('');
  }

}
  

  constructor() {
  effect(() => {

  this.searchText();
  this.selectedStatus();
  this.selectedType();

  this.dataSource.data = this.filteredApplications();

});

  this.searchSubject
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(value => value.trim().toLowerCase()),
      filter(value => value.length === 0 || value.length >= 2)
    )
    .subscribe(value => {

      this.searchText.set(value);

    });

  this.route.queryParams.subscribe(params => {

    const search = params['search'] || '';

    this.searchText.set(search);

  });
}
loadApplications() {

  this.jobService
    .loadApplications()
    .subscribe();

}


ngOnInit() {

  this.loadApplications()
    

}



displayedColumns = [
  'number',
  'jobTitle',
  'company',
  'status',
  'appliedDate',
  'actions'
];


  // Filtered applications
  filteredApplications = computed(() => {

    const search = this.searchText().toLowerCase().trim();
    const status = this.selectedStatus();
    const type = this.selectedType();


    return this.applications().filter(app => {

      // Search filter
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(search) ||
        app.company.toLowerCase().includes(search);

      // Status filter
      const matchesStatus =
        status === 'All Status' ||
        app.status === status;

      // Type filter
      const matchesType =
        type === 'All Types' ||
        app.jobType === type;

      return matchesSearch && matchesStatus && matchesType;

    });

  });

  

 


  deleteApplication(id: string) {

  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '380px',
    maxWidth: '90vw',
    panelClass: 'jobtrack-dialog',

    data: {
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application?',
      confirmText: 'Delete'
    },
  });


  dialogRef.afterClosed().subscribe(result => {

    if (result === true) {

      this.jobService.deleteApplication(id).subscribe({

        next: () => {

  console.log(
    'Application deleted successfully'
  );

  this.loadApplications();

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


  
editApplication(application: JobApplication) {
  this.router.navigate([
    '/add-applications',
    application.id
  ]);
}

  viewApplication(application: JobApplication) {

    this.router.navigate([
      '/application-details',
      application.id
    ]);

  }

}