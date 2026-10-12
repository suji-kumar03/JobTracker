import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddApplications } from './add-applications';
import { Job } from '../services/job';

describe('AddApplications', () => {
  let component: AddApplications;
  let fixture: ComponentFixture<AddApplications>;

  beforeEach(async () => {
    localStorage.setItem('loggedInEmail', 'test@example.com');
    localStorage.setItem('users', JSON.stringify([]));

    await TestBed.configureTestingModule({
      imports: [AddApplications],
      providers: [
        Job,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: vi.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn().mockReturnValue(null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddApplications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('loggedInEmail');
    localStorage.removeItem('users');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Applied as the default status', () => {
    expect(component.jobForm.controls.status.value).toBe('Applied');
  });

  it('should have an invalid form initially', () => {
    expect(component.jobForm.invalid).toBe(true);
  });

  it('should require job title', () => {
    const control = component.jobForm.controls.jobTitle;

    control.setValue('');

    expect(control.hasError('required')).toBe(true);
  });

  it('should require job title to have at least 3 characters', () => {
    const control = component.jobForm.controls.jobTitle;

    control.setValue('AB');

    expect(control.hasError('minlength')).toBe(true);
  });

  it('should require company name to have at least 2 characters', () => {
    const control = component.jobForm.controls.company;

    control.setValue('A');

    expect(control.hasError('minlength')).toBe(true);
  });

  it('should mark all fields as touched when saving an invalid form', () => {
    component.saveApplication();

    expect(component.jobForm.controls.jobTitle.touched).toBe(true);
    expect(component.jobForm.invalid).toBe(true);
  });
});