import { Component, EventEmitter, Output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Job } from '../services/job';
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
    FormField,MatIconModule
  ],

  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  title = 'JobTrack';
  subtitle = 'Track Your Career Journey';
  welcomeText = 'Welcome Back!';

 

  loginData = signal({
    email: '',
    password: '',
    rememberMe: false
  });
 


  

  loginForm = form(
    this.loginData,
    (schema) => {

      required(schema.email);

      email(schema.email);

      required(schema.password);

    }
  );


  showPassword = signal(false);

  loginError = signal('');

  loginSuccess = signal(false);


  @Output() loginSuccessEvent =
    new EventEmitter<void>();


  constructor(
    private router: Router,
    private jobService: Job
  ) {}


  

  togglePassword() {

    this.showPassword.update(
      value => !value
    );

  }


 

 login() {

 
  this.loginError.set('');

  
  if (this.loginForm().invalid()) {

    this.loginForm.email().markAsTouched();
    this.loginForm.password().markAsTouched();

    return;
  }


  const emailValue = this.loginData().email;
  const passwordValue = this.loginData().password;

 
  const savedUsers = localStorage.getItem('users');

  if (!savedUsers) {
    this.showLoginError(
      'No account found. Please sign up first'
    );
    return;
  }

  const users = JSON.parse(savedUsers);


  const user = users.find(
    (u: any) => u.email === emailValue
  );

  
  if (!user) {
    this.showLoginError(
      'No account found. Please sign up first'
    );
    return;
  }

  
  if (user.password !== passwordValue) {
    this.showLoginError(
      'Check Password'
    );
    return;
  }

  
  localStorage.setItem(
    'loggedInEmail',
    user.email
  );

  this.jobService.loadApplications();

  this.loginSuccess.set(true);

  this.loginSuccessEvent.emit();

  this.router.navigate(['/dashboard']);
}


  

  showLoginError(message: string) {

    this.loginError.set(message);

    setTimeout(() => {

      this.loginError.set('');

    }, 2000);

  }

}