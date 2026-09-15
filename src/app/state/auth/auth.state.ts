import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../domain/auth/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly _user = signal<User | null>(this.loadUser());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  private loadUser(): User | null {
    const raw = localStorage.getItem('sgo_user');
    return raw ? JSON.parse(raw) : null;
  }

  setUser(user: User): void {
    localStorage.setItem('sgo_user', JSON.stringify(user));
    this._user.set(user);
  }

  clearUser(): void {
    localStorage.removeItem('sgo_user');
    this._user.set(null);
  }

  getUserRut(): string {
    return this._user()?.rut_normalizado || '';
  }
}
