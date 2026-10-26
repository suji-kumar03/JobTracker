import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';

export interface User {
  id?: string;
  userCode?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  defaultJobType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  getUsers(): Observable<User[]> {
  return this.http.get<User[]>(this.apiUrl);
}
updateUser(user: User): Observable<User> {
  return this.http.put<User>(
    `${this.apiUrl}/${user.id}`,
    user
  );
}

  register(user: User): Observable<User> {
    return this.getUsers().pipe(
      switchMap(users => {
        const maxCode = users.reduce((max, existingUser) => {
          const match = existingUser.userCode?.match(/^USER-(\d+)$/);

          return match
            ? Math.max(max, Number(match[1]))
            : max;
        }, 0);

        const newUser: User = {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          userCode: `USER-${String(maxCode + 1).padStart(3, '0')}`
        };

        console.log('New user payload:', newUser);

        return this.http.post<User>(this.apiUrl, newUser);
      })
    );
  }

  login(email: string, password: string): Observable<User | undefined> {
    const url = `${this.apiUrl}?email=${encodeURIComponent(email.trim())}`;

    return this.http.get<User[]>(url).pipe(
      map(users =>
        users.find(user => user.password === password)
      )
    );
  }
}