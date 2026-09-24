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

  clearError() {
    if (this.errorMessage()) this.errorMessage.set('');
  }

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
      this.focusFirstInvalid(rut, password);
      return;
    }

    // Validar formato RUT (minimo 7 digitos + guion + digito verificador)
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    if (rutLimpio.length < 8 || rutLimpio.length > 9) {
      this.errorMessage.set('RUT invalido. Ejemplo: 12345678-5');
      this.focusRut();
      return;
    }

    // Validar que termine en guion + verificador
    if (!rut.includes('-')) {
      this.errorMessage.set('RUT debe incluir guion y digito verificador');
      this.focusRut();
      return;
    }

    // Validar password minimo 6 caracteres
    if (password.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres');
      this.focusPassword();
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

  private focusRut() {
    const el = document.getElementById('login-rut');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    (el as HTMLElement | null)?.focus?.();
  }

  private focusPassword() {
    const el = document.getElementById('login-password');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    (el as HTMLElement | null)?.focus?.();
  }

  private focusFirstInvalid(rut: string, password: string) {
    if (!rut) this.focusRut();
    else this.focusPassword();
  }
}
