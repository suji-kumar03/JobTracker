
import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  form,
  FormField,
  required,
  email,
  minLength,
  pattern,
  validate
} from '@angular/forms/signals';
import { Auth } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    RouterLink,
    FormField,
    MatIconModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  private auth = inject(Auth);
  private router = inject(Router);

  signupData = signal({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  duplicateEmailError = signal('');
  signupError = signal('');
  isSubmitting = signal(false);

  signupForm = form(this.signupData, (schema) => {
    required(schema.name);

    required(schema.email);
    email(schema.email);

    required(schema.password);
    minLength(schema.password, 8);
    pattern(schema.password, /[A-Z]/);
    pattern(schema.password, /[!@#$%^&*(),.?":{}|<>_\-]/);

    required(schema.confirmPassword);

    validate(schema.confirmPassword, ({ value }) => {
      if (value() !== this.signupData().password) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match'
        };
      }
      return null;
    });
  });

  signup() {
    this.duplicateEmailError.set('');
    this.signupError.set('');

    if (this.signupForm().invalid()) {
      this.signupForm.name().markAsTouched();
      this.signupForm.email().markAsTouched();
      this.signupForm.password().markAsTouched();
      this.signupForm.confirmPassword().markAsTouched();
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    const nameValue = this.signupData().name.trim();
    const emailValue = this.signupData().email.trim();
    const passwordValue = this.signupData().password;

    this.isSubmitting.set(true);

    this.auth.getUsers().subscribe({
      next: (users) => {
        const existingUser = users.find(
          user => user.email.toLowerCase() === emailValue.toLowerCase()
        );

        if (existingUser) {
          this.duplicateEmailError.set(
            'This email is already registered'
          );
          this.signupForm.email().markAsTouched();
          this.isSubmitting.set(false);
          return;
        }

        this.auth.register({
          name: nameValue,
          email: emailValue,
          password: passwordValue,
          role: 'user'
        }).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.router.navigate(['/login']);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.signupError.set(
              'Unable to register. Please try again.'
            );
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.signupError.set(
          'Unable to connect to the server. Please try again.'
        );
      }
    });
  }
}
