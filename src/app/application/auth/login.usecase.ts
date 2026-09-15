import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AUTH_REPOSITORY } from '../../core/tokens/repository.tokens';
import { AuthRepository } from '../../domain/auth/repositories/auth.repository';
import { AuthState } from '../../state/auth/auth.state';
import { LoginRequest, User } from '../../domain/auth/models/user.model';

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private authRepo = inject<AuthRepository>(AUTH_REPOSITORY);
  private authState = inject(AuthState);

  execute(credentials: LoginRequest): Observable<User> {
    return this.authRepo.login(credentials).pipe(
      tap((user) => this.authState.setUser(user))
    );
  }
}
