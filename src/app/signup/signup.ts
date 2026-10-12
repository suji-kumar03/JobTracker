import { Component, signal } from '@angular/core';
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

  constructor(
    private router: Router
  ) {}



  signupData = signal({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  showPassword = signal(false);
showConfirmPassword = signal(false);


 

  signupForm = form(
  this.signupData,
  (schema) => {

    required(schema.name);

    required(schema.email);
    email(schema.email);

    required(schema.password);
    minLength(schema.password, 8);

    pattern(
      schema.password,
      /[A-Z]/
    );

    pattern(
      schema.password,
      /[!@#$%^&*(),.?":{}|<>_\-]/
    );

    required(schema.confirmPassword);

    validate(schema.confirmPassword, ({ value }) => {

      if (
        value() !== this.signupData().password
      ) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match'
        };
      }

      return null;
    });

  }
);


 

  duplicateEmailError = signal('');





  signup() {


  this.duplicateEmailError.set('');


 

  if (this.signupForm().invalid()) {

    this.signupForm.name().markAsTouched();

    this.signupForm.email().markAsTouched();

    this.signupForm.password().markAsTouched();

    this.signupForm.confirmPassword().markAsTouched();

    return;
  }



  const nameValue =
    this.signupData().name.trim();

  const emailValue =
    this.signupData().email.trim();

  const passwordValue =
    this.signupData().password;




  const savedUsers =
    localStorage.getItem('users');


  const users = savedUsers
    ? JSON.parse(savedUsers)
    : [];




  const existingUser =
    users.find(
      (user: any) =>
        user.email === emailValue
    );


  if (existingUser) {

    this.duplicateEmailError.set(
      'This email is already registered'
    );

    this.signupForm
      .email()
      .markAsTouched();

    return;
  }


 

  const user = {

    name: nameValue,

    email: emailValue,

    password: passwordValue

  };




  users.push(user);


 

  localStorage.setItem(
    'users',
    JSON.stringify(users)
  );


  console.log(
    'Saved users:',
    users
  );




  this.router.navigate([
    '/login'
  ]);

}

}