
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApplicationDetails } from './application-details';
import { Job, JobApplication } from '../services/job';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

describe('ApplicationDetails', () => {
  let component: ApplicationDetails;
  let fixture: ComponentFixture<ApplicationDetails>;

  let jobService: {
    getApplicationById: ReturnType<typeof vi.fn>;
    deleteApplication: ReturnType<typeof vi.fn>;
    loadApplications: ReturnType<typeof vi.fn>;
    applications: {
      set: ReturnType<typeof vi.fn>;
    };
  };

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let dialog: {
    open: ReturnType<typeof vi.fn>;
  };

  let route: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };

  const mockApplication = {
    id: '1',
    userEmail: 'test@example.com',
    jobTitle: 'Frontend Developer',
    company: 'ABC Company',
    jobType: 'Full-time',
    status: 'Applied',
    appliedDate: '2026-10-10',
    location: 'Bengaluru',
    description: 'Angular developer role',
    requirements: 'JavaScript and Angular',
    isRemote: false
  } as JobApplication;

  const mockDialogResult = (result: boolean) => ({
    afterClosed: () => of(result)
  });

  beforeEach(async () => {
    jobService = {
      getApplicationById: vi.fn().mockReturnValue(
        of(mockApplication)
      ),
      deleteApplication: vi.fn().mockReturnValue(
        of({})
      ),
      loadApplications: vi.fn().mockReturnValue(
        of([mockApplication])
      ),
      applications: {
        set: vi.fn()
      }
    };

    router = {
      navigate: vi.fn()
    };

    dialog = {
      open: vi.fn().mockReturnValue(
        mockDialogResult(true)
      )
    };

    route = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
  imports: [ApplicationDetails],
  providers: [
    { provide: Job, useValue: jobService },
    { provide: ActivatedRoute, useValue: route },
    { provide: Router, useValue: router }
  ]
});

TestBed.overrideProvider(MatDialog, {
  useValue: dialog
});

await TestBed.compileComponents();

    fixture = TestBed.createComponent(ApplicationDetails);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // COMPONENT CREATION

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // LOAD APPLICATION

  it('should load application using the route ID', () => {
    expect(jobService.getApplicationById)
      .toHaveBeenCalledWith('1');

    expect(component.application())
      .toEqual(mockApplication);
  });

  it('should not load application when route ID is missing', () => {
    jobService.getApplicationById.mockClear();
    route.snapshot.paramMap.get.mockReturnValue(null);

    component.ngOnInit();

    expect(jobService.getApplicationById)
      .not.toHaveBeenCalled();
  });

  it('should handle an error when loading application', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    jobService.getApplicationById.mockReturnValue(
      throwError(() => new Error('Load failed'))
    );

    component.ngOnInit();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to load application:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  // EDIT APPLICATION

  it('should open edit confirmation dialog', () => {
    component.editApplication();

    expect(dialog.open).toHaveBeenCalledWith(
      ConfirmDialog,
      expect.objectContaining({
        width: '380px',
        data: expect.objectContaining({
          title: 'Edit Application',
          message: 'Are you sure you want to edit this application?',
          confirmText: 'Edit'
        })
      })
    );
  });

  it('should navigate to edit page when edit is confirmed', () => {
    component.editApplication();

    expect(router.navigate).toHaveBeenCalledWith([
      '/add-applications',
      '1'
    ]);
  });

  it('should not navigate when edit is cancelled', () => {
    dialog.open.mockReturnValue(
      mockDialogResult(false)
    );

    component.editApplication();

    expect(router.navigate)
      .not.toHaveBeenCalled();
  });

  // DELETE APPLICATION

  it('should open delete confirmation dialog', () => {
    component.deleteApplication();

    expect(dialog.open).toHaveBeenCalledWith(
      ConfirmDialog,
      expect.objectContaining({
        width: '380px',
        data: expect.objectContaining({
          title: 'Delete Application',
          message: 'Are you sure you want to delete this application?',
          confirmText: 'Delete'
        })
      })
    );
  });

  it('should delete application when confirmed', () => {
    component.deleteApplication();

    expect(jobService.deleteApplication)
      .toHaveBeenCalledWith('1');

    expect(jobService.loadApplications)
      .toHaveBeenCalled();

    expect(jobService.applications.set)
      .toHaveBeenCalledWith([mockApplication]);

    expect(router.navigate)
      .toHaveBeenCalledWith(['/applications']);
  });

  it('should not delete application when cancelled', () => {
    dialog.open.mockReturnValue(
      mockDialogResult(false)
    );

    component.deleteApplication();

    expect(jobService.deleteApplication)
      .not.toHaveBeenCalled();

    expect(jobService.loadApplications)
      .not.toHaveBeenCalled();

    expect(router.navigate)
      .not.toHaveBeenCalled();
  });

  it('should handle an error when deleting application', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    jobService.deleteApplication.mockReturnValue(
      throwError(() => new Error('Delete failed'))
    );

    component.deleteApplication();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to delete application:',
      expect.any(Error)
    );

    expect(jobService.loadApplications)
      .not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  // UNDEFINED APPLICATION

  it('should not open dialog when application is undefined', () => {
    component.application.set(undefined);

    component.editApplication();
    component.deleteApplication();

    expect(dialog.open)
      .not.toHaveBeenCalled();

    expect(jobService.deleteApplication)
      .not.toHaveBeenCalled();
  });
});
