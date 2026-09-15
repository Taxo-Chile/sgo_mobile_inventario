import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthState } from '../../../state/auth/auth.state';
import { LoginUseCase } from '../../../application/auth/login.usecase';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private router = inject(Router);
  private authState = inject(AuthState);
  private loginUseCase = inject(LoginUseCase);
  private notificationService = inject(NotificationService);

  rut = signal('');
  password = signal('');
  loading = signal(false);
  errorMessage = signal('');

  ionViewWillEnter() {
    if (this.authState.isLoggedIn()) {
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }

  async onLogin() {
    const rut = this.rut().trim();
    const password = this.password().trim();

    if (!rut || !password) {
      this.errorMessage.set('Ingresa RUT y contraseña');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.loginUseCase.execute({ rut, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Error al iniciar sesión');
      },
    });
  }
}
