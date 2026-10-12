import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of ,tap,catchError,map} from 'rxjs';

export interface JobApplication {
  id: string;
  userEmail: string;
  jobTitle: string;
  company: string;
  jobType: string;
  status: string;
  appliedDate: string;
  location: string;
  description: string;
  requirements: string;
  isRemote: boolean;
}

export type NewJobApplication =
  Omit<JobApplication, 'id' | 'userEmail'>;

@Injectable({
  providedIn: 'root',
})
export class Job {

  applications = signal<JobApplication[]>([]);
  isLoading = signal(false);
apiError = signal('');

  private get loggedInEmail(): string | null {
  return localStorage.getItem('loggedInEmail');
}

  private apiUrl =
    'http://localhost:3000/applications';


  constructor(private http: HttpClient) {}


 

  loadApplications(): Observable<JobApplication[]> {
  if (!this.loggedInEmail) {
    return of([]);
  }
  this.isLoading.set(true);
  this.apiError.set('');

  return this.http.get<JobApplication[]>(
    `${this.apiUrl}?userEmail=${this.loggedInEmail}`
  ).pipe(
    map(applications =>
    applications.map(app => ({
      ...app,
      jobTitle: app.jobTitle.trim()
    }))
  ),

    tap(data => {

  this.applications.set(data);

  this.isLoading.set(false);

  console.log('Applications received from API:', data);
  console.log('Loading:', this.isLoading());
}),

    catchError(error => {
      console.error('API Error:', error);

      return of([]);
    })

  );
}




  addApplication(
    application: NewJobApplication
  ): Observable<JobApplication> {

    const newApplication = {
      ...application,
      userEmail: this.loggedInEmail!
    };

    return this.http.post<JobApplication>(
  this.apiUrl,
  newApplication
).pipe(
  tap(createdApplication => {

    this.applications.update(applications => [
      ...applications,
      createdApplication
    ]);

  })
);
  }




  updateApplication(
  application: JobApplication
): Observable<JobApplication> {

  return this.http.put<JobApplication>(
    `${this.apiUrl}/${application.id}`,
    application
  ).pipe(
    tap(updatedApplication => {

      this.applications.update(applications =>
        applications.map(app =>
          app.id === updatedApplication.id
            ? updatedApplication
            : app
        )
      );

    })
  );
}


  

  deleteApplication(
  id: string
): Observable<void> {

  return this.http.delete<void>(
    `${this.apiUrl}/${id}`
  ).pipe(
    tap(() => {

      this.applications.update(applications =>
        applications.filter(app => app.id !== id)
      );

    })
  );
}


  

  getApplicationById(
  id: string
): Observable<JobApplication> {

  return this.http.get<JobApplication>(
    `${this.apiUrl}/${id}`
  );

}

  clearApplications() {

    this.applications.set([]);

  }

}