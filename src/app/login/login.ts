
import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Job } from '../services/job';
import { Auth } from '../services/auth';
import { MatIconModule } from '@angular/material/icon';
import {
  form,
  FormField,
  required,
  email
} from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FormField,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private router = inject(Router);
  private jobService = inject(Job);
  private auth = inject(Auth);

  title = signal('JobTrack');
  subtitle = 'Track Your Career Journey';
  welcomeText = 'Welcome Back!';

  loginData = signal({
    email: '',
    password: '',
    rememberMe: false
  });

  loginForm = form(this.loginData, (schema) => {
    required(schema.email);
    email(schema.email);
    required(schema.password);
  });

  showPassword = signal(false);
  loginError = signal('');
  loginSuccess = signal(false);
  isSubmitting = signal(false);

  login() {
    this.loginError.set('');

    if (this.loginForm().invalid()) {
      this.loginForm.email().markAsTouched();
      this.loginForm.password().markAsTouched();
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    const emailValue = this.loginData().email.trim();
    const passwordValue = this.loginData().password;

    this.isSubmitting.set(true);

    this.auth.login(emailValue, passwordValue).subscribe({
      next: (user) => {
        if (!user) {
          this.isSubmitting.set(false);

          this.showLoginError(
            'Invalid email or password'
          );
          return;
        }

        localStorage.setItem('loggedInEmail', user.email);
        localStorage.setItem('loggedInUserCode', user.userCode ?? '');
        localStorage.setItem('loggedInRole', user.role);

        this.jobService.loadApplications().subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.loginSuccess.set(true);
            if (user.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: () => {
            this.isSubmitting.set(false);
            this.showLoginError(
              'Unable to load applications. Please try again.'
            );
          }
        });
      },
      error: () => {
        this.isSubmitting.set(false);

        this.showLoginError(
          'Unable to connect to the server. Please try again.'
        );
      }
    });
  }

  showLoginError(message: string) {
    this.loginError.set(message);

    setTimeout(() => {
      this.loginError.set('');
    }, 2000);
  }
}
