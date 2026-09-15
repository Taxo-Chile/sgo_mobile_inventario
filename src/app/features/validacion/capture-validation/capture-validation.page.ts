import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValidacionState } from '../../../state/validacion/validacion.state';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../../shared/components/connectivity-banner/connectivity-banner.component';
import { ValidacionCaptura } from '../../../domain/validacion/models/validacion.model';

@Component({
  selector: 'app-capture-validation',
  standalone: true,
  imports: [IonicModule, FormsModule, ConnectivityBannerComponent],
  templateUrl: './capture-validation.page.html',
  styleUrls: ['./capture-validation.page.scss'],
})
export class CaptureValidationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private validacionState = inject(ValidacionState);
  private notification = inject(NotificationService);

  captura = signal<ValidacionCaptura | null>(null);
  c2Cantidad = signal<number | null>(null);
  motivo = signal('');
  modo = signal<'CONFIRMAR' | 'MODIFICAR'>('CONFIRMAR');

  ngOnInit() {
    const capturaId = Number(this.route.snapshot.paramMap.get('capturaId'));
    if (!capturaId) {
      this.router.navigate(['/home']);
      return;
    }

    const capturas = this.validacionState.capturas();
    const found = capturas.find((c) => c.captura_id === capturaId);
    if (!found) {
      this.notification.error('Captura no encontrada');
      this.router.navigate(['/home']);
      return;
    }

    this.captura.set(found);
    this.c2Cantidad.set(found.c1_cantidad);
  }

  setModo(modo: 'CONFIRMAR' | 'MODIFICAR') {
    this.modo.set(modo);
    if (modo === 'CONFIRMAR') {
      this.c2Cantidad.set(this.captura()?.c1_cantidad ?? null);
      this.motivo.set('');
    }
  }

  guardar() {
    const captura = this.captura();
    if (!captura) return;

    if (this.modo() === 'CONFIRMAR') {
      this.validacionState.confirmarCaptura(captura.captura_id);
      this.notification.success('Captura confirmada');
    } else {
      const cantidad = this.c2Cantidad();
      if (cantidad === null || cantidad < 0) {
        this.notification.error('Ingresa una cantidad válida');
        return;
      }
      if (!this.motivo().trim()) {
        this.notification.error('Ingresa un motivo de modificación');
        return;
      }
      this.validacionState.modificarCaptura(captura.captura_id, cantidad, this.motivo().trim());
      this.notification.success('Captura modificada');
    }

    this.router.navigate(['/tag', this.captura()?.tag_id]);
  }

  goBack() {
    const tagId = this.captura()?.tag_id;
    if (tagId) {
      this.router.navigate(['/tag', tagId]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
