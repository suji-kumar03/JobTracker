
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  of,
  tap,
  catchError,
  map,
  switchMap,
  throwError
} from 'rxjs';

export interface JobApplication {
  id: string;
  applicationCode: string;
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
  createdOn?: string | null;
  modifiedOn?: string | null;
}

export type NewJobApplication =
  Omit<JobApplication, 'id' | 'applicationCode' | 'userEmail' | 'createdOn' | 'modifiedOn'>;

@Injectable({
  providedIn: 'root'
})
export class Job {
  applications = signal<JobApplication[]>([]);
  isLoading = signal(false);
  apiError = signal('');

  private apiUrl = 'http://localhost:3000/applications';

  constructor(private http: HttpClient) { }

  private get loggedInEmail(): string | null {
    return localStorage.getItem('loggedInEmail');
  }


  loadApplications(): Observable<JobApplication[]> {
    const email = this.loggedInEmail;

    if (!email) {
      this.applications.set([]);
      return of([]);
    }

    this.isLoading.set(true);
    this.apiError.set('');

    return this.http.get<JobApplication[]>(
      `${this.apiUrl}?userEmail=${encodeURIComponent(email)}`
    ).pipe(
      map(applications =>
        applications.map(app => ({
          ...app,
          jobTitle: app.jobTitle.trim()
        }))
      ),
      tap(applications => {
        this.applications.set(applications);
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error('API Error:', error);
        this.apiError.set('Unable to load applications.');
        this.isLoading.set(false);
        this.applications.set([]);
        return of([]);
      })
    );
  }

  getApplicationByCode(code: string): Observable<JobApplication> {
    const email = this.loggedInEmail;

    if (!email) {
      return throwError(() => new Error('No logged-in email found.'));
    }

    return this.http.get<JobApplication[]>(
      `${this.apiUrl}?applicationCode=${encodeURIComponent(code)}&userEmail=${encodeURIComponent(email)}`
    ).pipe(
      map(applications => {
        if (applications.length === 0) {
          throw new Error('Application not found.');
        }

        return applications[0];
      })
    );
  }


  addApplication(application: NewJobApplication): Observable<JobApplication> {
    const email = this.loggedInEmail;

    if (!email) {
      return throwError(() => new Error('No logged-in email found.'));
    }

    return this.http.get<JobApplication[]>(
      `${this.apiUrl}?userEmail=${encodeURIComponent(email)}`
    ).pipe(
      switchMap(userApplications => {
        const maxNumber = userApplications.reduce((max, app) => {
          const match = app.applicationCode?.match(/^APP-(\d+)$/);

          return match
            ? Math.max(max, Number(match[1]))
            : max;
        }, 0);

        const now = new Date().toISOString();

        const newApplication = {
          ...application,
          userEmail: email,
          applicationCode: `APP-${String(maxNumber + 1).padStart(3, '0')}`,
          createdOn: now,
          modifiedOn: null
        };

        return this.http.post<JobApplication>(
          this.apiUrl,
          newApplication
        );
      }),
      tap(createdApplication => {
        this.applications.update(applications => [
          ...applications,
          createdApplication
        ]);
      })
    );
  }

  updateApplication(application: JobApplication): Observable<JobApplication> {
    return this.getApplicationByCode(application.applicationCode).pipe(
      switchMap(existing =>
        this.http.put<JobApplication>(
          `${this.apiUrl}/${existing.id}`,
          {
            ...existing,
            ...application,
            id: existing.id,
            applicationCode: existing.applicationCode,
            userEmail: existing.userEmail,
            createdOn: existing.createdOn ?? application.createdOn ?? null,
            modifiedOn: new Date().toISOString()
          }
        )
      ),
      tap(updatedApplication => {
        this.applications.update(applications =>
          applications.map(app =>
            app.applicationCode === updatedApplication.applicationCode &&
              app.userEmail === updatedApplication.userEmail
              ? updatedApplication
              : app
          )
        );
      })
    );
  }


  deleteApplication(code: string): Observable<void> {
    return this.getApplicationByCode(code).pipe(
      switchMap(application =>
        this.http.delete<void>(
          `${this.apiUrl}/${application.id}`
        )
      ),
      tap(() => {
        const email = this.loggedInEmail;

        this.applications.update(applications =>
          applications.filter(app =>
            app.applicationCode !== code || app.userEmail !== email
          )
        );
      })
    );
  }

  clearApplications(): Observable<void> {
  const email = this.loggedInEmail;

  if (!email) {
    return throwError(() => new Error('No logged-in user found.'));
  }

  return this.http
    .get<JobApplication[]>(
      `${this.apiUrl}?userEmail=${encodeURIComponent(email)}`
    )
    .pipe(
      switchMap(applications => {
        if (applications.length === 0) {
          this.applications.set([]);
          return of(undefined);
        }

        return new Observable<void>(observer => {
          let deletedCount = 0;

          applications.forEach(application => {
            this.http.delete<void>(
              `${this.apiUrl}/${application.id}`
            ).subscribe({
              next: () => {
                deletedCount++;

                if (deletedCount === applications.length) {
                  this.applications.set([]);
                  observer.next();
                  observer.complete();
                }
              },
              error: error => observer.error(error)
            });
          });
        });
      })
    );
}
}
