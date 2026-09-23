import { Injectable } from '@angular/core';
import { from, Observable, map, catchError, of } from 'rxjs';
import { HttpClient } from '../../core/http/http-client';
import { AuthRepository } from '../../domain/auth/repositories/auth.repository';
import { User, LoginRequest } from '../../domain/auth/models/user.model';
import { MockDataService } from '../../shared/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class AuthApiRepository implements AuthRepository {
  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  login(credentials: LoginRequest): Observable<User> {
    return from(this.http.post<{ user: User }>('auth/login.php', credentials)).pipe(
      map((res) => res.user),
      catchError((err) => {
        // Solo fallback a mock en errores de red o servidor (sin status o 5xx)
        // Los 4xx (401 credenciales invalidas, 400 validacion) se propagan como error
        const isNetworkError = !err.status;
        const isServerError = err.status >= 500;
        if (isNetworkError || isServerError) {
          console.log('API no disponible, usando datos mockup');
          return this.mockData.login();
        }
        // Error de negocio (401, 400, etc.) - propagar al componente
        throw err;
      })
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
