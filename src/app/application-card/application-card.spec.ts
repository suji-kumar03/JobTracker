import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ApplicationCard } from './application-card';
import { JobApplication } from '../services/job';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ApplicationCard', () => {
  let component: ApplicationCard;
  let fixture: ComponentFixture<ApplicationCard>;

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
    await TestBed.configureTestingModule({
      imports: [ApplicationCard]
    })
      .overrideComponent(ApplicationCard, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ApplicationCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('application', mockApplication);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive the application input', () => {
    expect(component.application()).toEqual(mockApplication);
  });

  it('should emit the application ID when delete is called', () => {
    const emitSpy = vi.spyOn(component.deleteApplication, 'emit');

    component.delete();

    expect(emitSpy).toHaveBeenCalledWith(mockApplication.id);
  });

  it('should emit the application when edit is called', () => {
    const emitSpy = vi.spyOn(component.editApplication, 'emit');

    component.edit();

    expect(emitSpy).toHaveBeenCalledWith(mockApplication);
  });

  it('should emit the application when view is called', () => {
    const emitSpy = vi.spyOn(component.viewApplication, 'emit');

    component.view();

    expect(emitSpy).toHaveBeenCalledWith(mockApplication);
  });
});