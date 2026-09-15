import { Injectable } from '@angular/core';
import { from, Observable, map } from 'rxjs';
import { HttpClient } from '../../core/http/http-client';
import { AuthRepository } from '../../domain/auth/repositories/auth.repository';
import { User, LoginRequest } from '../../domain/auth/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthApiRepository implements AuthRepository {
  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<User> {
    return from(this.http.post<{ user: User }>('auth/login.php', credentials)).pipe(
      map((res) => res.user)
    );
  }

  logout(): void {
    localStorage.removeItem('sgo_user');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('sgo_user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('sgo_user');
  }
}
