
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialog } from './confirm-dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ConfirmDialog', () => {
  let component: ConfirmDialog;
  let fixture: ComponentFixture<ConfirmDialog>;

  let dialogRef: {
    close: ReturnType<typeof vi.fn>;
  };

  const mockData = {
    title: 'Delete Application',
    message: 'Are you sure you want to delete this application?',
    confirmText: 'Delete'
  };

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockData
        }
      ]
    })
    .overrideComponent(ConfirmDialog, {
      set: { template: '' }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive dialog data', () => {
    expect(component.data).toEqual(mockData);
  });

  it('should close the dialog with false when cancel is called', () => {
    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close the dialog with true when confirm is called', () => {
    component.confirm();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
