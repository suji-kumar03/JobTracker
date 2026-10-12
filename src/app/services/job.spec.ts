import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { Job, JobApplication, NewJobApplication } from './job';

describe('Job', () => {
  let service: Job;
  let httpMock: HttpTestingController;

  const mockApplication: JobApplication = {
    id: '1',
    userEmail: 'test@example.com',
    jobTitle: 'Frontend Developer',
    company: 'ABC Company',
    jobType: 'Full-time',
    status: 'Applied',
    appliedDate: '2026-10-09',
    location: 'Chennai',
    description: 'Angular developer role',
    requirements: 'JavaScript, Angular',
    isRemote: false
  };

  beforeEach(() => {
    localStorage.setItem('loggedInEmail', 'test@example.com');

    TestBed.configureTestingModule({
      providers: [
        Job,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(Job);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('loggedInEmail');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load applications', () => {
    service.loadApplications().subscribe();

    const req = httpMock.expectOne(
      'http://localhost:3000/applications?userEmail=test@example.com'
    );

    expect(req.request.method).toBe('GET');

    req.flush([mockApplication]);

    expect(service.applications()).toEqual([mockApplication]);
    expect(service.isLoading()).toBe(false);
  });

  it('should add an application', () => {
    const newApplication: NewJobApplication = {
      jobTitle: 'Frontend Developer',
      company: 'ABC Company',
      jobType: 'Full-time',
      status: 'Applied',
      appliedDate: '2026-10-09',
      location: 'Chennai',
      description: 'Angular developer role',
      requirements: 'JavaScript, Angular',
      isRemote: false
    };

    service.addApplication(newApplication).subscribe();

    const req = httpMock.expectOne(
      'http://localhost:3000/applications'
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body.userEmail).toBe('test@example.com');

    req.flush(mockApplication);

    expect(service.applications()).toEqual([mockApplication]);
  });

  it('should update an application', () => {
    const updatedApplication = {
      ...mockApplication,
      status: 'Interview'
    };

    service.applications.set([mockApplication]);

    service.updateApplication(updatedApplication).subscribe();

    const req = httpMock.expectOne(
      'http://localhost:3000/applications/1'
    );

    expect(req.request.method).toBe('PUT');

    req.flush(updatedApplication);

    expect(service.applications()).toEqual([updatedApplication]);
    expect(service.applications()[0].status).toBe('Interview');
  });

  it('should delete an application', () => {
    service.applications.set([mockApplication]);

    service.deleteApplication('1').subscribe();

    const req = httpMock.expectOne(
      'http://localhost:3000/applications/1'
    );

    expect(req.request.method).toBe('DELETE');

    req.flush(null);

    expect(service.applications()).toEqual([]);
  });
  it('should return empty array when user is not logged in', () => {
  localStorage.removeItem('loggedInEmail');

  service.loadApplications().subscribe(data => {
    expect(data).toEqual([]);
  });

  httpMock.expectNone(() => true);
});
it('should return empty array when API request fails', () => {
  service.loadApplications().subscribe(data => {
    expect(data).toEqual([]);
  });

  const req = httpMock.expectOne(
    'http://localhost:3000/applications?userEmail=test@example.com'
  );

  req.flush('API error', {
    status: 500,
    statusText: 'Server Error'
  });
});
});
