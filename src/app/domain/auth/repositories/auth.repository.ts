import { Observable } from 'rxjs';
import { User, LoginRequest } from '../models/user.model';

export interface AuthRepository {
  login(credentials: LoginRequest): Observable<User>;
  logout(): void;
  getCurrentUser(): User | null;
  isLoggedIn(): boolean;
}
