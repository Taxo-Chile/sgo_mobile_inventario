import { Observable } from 'rxjs';
import { User, LoginRequest } from '../models/user.model';

export abstract class AuthRepository {
  abstract login(credentials: LoginRequest): Observable<User>;
  abstract logout(): void;
  abstract getCurrentUser(): User | null;
  abstract isLoggedIn(): boolean;
}
