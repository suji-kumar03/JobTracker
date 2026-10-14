import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Applications } from './applications';
import { Job, JobApplication } from '../services/job';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Applications', () => {
  let component: Applications;
  let fixture: ComponentFixture<Applications>;

  let jobService: {
    applications: ReturnType<typeof signal<JobApplication[]>>;
    loadApplications: ReturnType<typeof vi.fn>;
    deleteApplication: ReturnType<typeof vi.fn>;
  };

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let dialog: {
    open: ReturnType<typeof vi.fn>;
  };

  const mockApplication: JobApplication = {
    id: '1',
    userEmail: 'test@example.com',
    jobTitle: 'Angular Developer',
    company: 'ABC Company',
    jobType: 'Full-time',
    status: 'Applied',
    appliedDate: '2026-10-10',
    location: 'Bengaluru',
    description: 'Angular development role',
    requirements: 'JavaScript and Angular',
    isRemote: false
  };

  beforeEach(async () => {
    jobService = {
      applications: signal<JobApplication[]>([mockApplication]),
      loadApplications: vi.fn().mockReturnValue(of([mockApplication])),
      deleteApplication: vi.fn().mockReturnValue(of(undefined))
    };

    router = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    dialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    };

    await TestBed.configureTestingModule({
      imports: [Applications],
      providers: [
        { provide: Job, useValue: jobService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        },
        { provide: MatDialog, useValue: dialog }
      ]
    })
      .overrideComponent(Applications, {
        set: {
          template: ''
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Applications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Component creation

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Loading applications

  it('should load applications on initialization', () => {
    expect(jobService.loadApplications).toHaveBeenCalled();
  });

  // Search filters

  it('should filter applications by job title', () => {
    component.appliedJobTitle.set('angular');

    expect(component.filteredApplications()).toHaveLength(1);
    expect(component.filteredApplications()[0].jobTitle)
      .toBe('Angular Developer');
  });

  it('should filter applications by company', () => {
    component.appliedCompany.set('abc');

    expect(component.filteredApplications()).toHaveLength(1);
    expect(component.filteredApplications()[0].company)
      .toBe('ABC Company');
  });

  it('should filter applications by status', () => {
    component.selectedStatus.set('Applied');

    expect(component.filteredApplications()).toHaveLength(1);

    component.selectedStatus.set('Rejected');

    expect(component.filteredApplications()).toHaveLength(0);
  });

  it('should filter applications by job type', () => {
    component.selectedType.set('Full-time');

    expect(component.filteredApplications()).toHaveLength(1);

    component.selectedType.set('Part-time');

    expect(component.filteredApplications()).toHaveLength(0);
  });

  it('should filter applications using the global search text', () => {
    component.searchText.set('angular');

    expect(component.filteredApplications()).toHaveLength(1);

    component.searchText.set('unknown');

    expect(component.filteredApplications()).toHaveLength(0);
  });

  // Apply search

  it('should apply the draft search filters', () => {
    component.draftJobTitle.set('  ANGULAR  ');
    component.draftCompany.set('  ABC  ');
    component.draftStatus.set('Applied');
    component.draftType.set('Full-time');

    component.applySearch();

    expect(component.appliedJobTitle()).toBe('angular');
    expect(component.appliedCompany()).toBe('abc');
    expect(component.selectedStatus()).toBe('Applied');
    expect(component.selectedType()).toBe('Full-time');

    expect(component.filteredApplications()).toHaveLength(1);
  });

  it('should clear all search filters', () => {
    component.draftJobTitle.set('Angular');
    component.draftCompany.set('ABC');
    component.draftStatus.set('Rejected');
    component.draftType.set('Part-time');

    component.applySearch();
    component.clearSearch();

    expect(component.draftJobTitle()).toBe('');
    expect(component.draftCompany()).toBe('');
    expect(component.draftStatus()).toBe('All Status');
    expect(component.draftType()).toBe('All Types');

    expect(component.appliedJobTitle()).toBe('');
    expect(component.appliedCompany()).toBe('');
    expect(component.searchText()).toBe('');
    expect(component.selectedStatus()).toBe('All Status');
    expect(component.selectedType()).toBe('All Types');

    expect(component.filteredApplications()).toHaveLength(1);
  });

  // Navigation

  it('should navigate to the edit page', () => {
    component.editApplication(mockApplication);

    expect(router.navigate).toHaveBeenCalledWith([
      '/add-applications',
      '1'
    ]);
  });

  it('should navigate to the application details page', () => {
    component.viewApplication(mockApplication);

    expect(router.navigate).toHaveBeenCalledWith([
      '/application-details',
      '1'
    ]);
  });

  // Delete confirmation dialog

  it('should open the delete confirmation dialog', () => {
    component.deleteApplication('1');

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should delete an application when confirmed', () => {
    component.deleteApplication('1');

    expect(jobService.deleteApplication).toHaveBeenCalledWith('1');
    expect(jobService.loadApplications).toHaveBeenCalled();
  });

  it('should not delete an application when cancelled', () => {
    dialog.open.mockReturnValue({
      afterClosed: () => of(false)
    });

    component.deleteApplication('1');

    expect(jobService.deleteApplication).not.toHaveBeenCalled();
  });

  it('should handle an error when deleting an application', () => {
    const error = new Error('Delete failed');

    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    jobService.deleteApplication.mockReturnValue(
      throwError(() => error)
    );

    component.deleteApplication('1');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to delete application:',
      error
    );

    consoleSpy.mockRestore();
  });
});