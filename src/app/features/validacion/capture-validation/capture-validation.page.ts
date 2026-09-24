import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValidacionState } from '../../../state/validacion/validacion.state';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../../shared/components/connectivity-banner/connectivity-banner.component';
import { ValidacionCaptura, ValidationResult } from '../../../domain/validacion/models/validacion.model';
import { VALIDACION_REPOSITORY } from '../../../core/tokens/repository.tokens';
import { ValidacionRepository } from '../../../domain/validacion/repositories/validacion.repository';

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
  private validacionRepo = inject<ValidacionRepository>(VALIDACION_REPOSITORY);

  captura = signal<ValidacionCaptura | null>(null);
  c2Cantidad = signal<number | null>(null);
  motivo = signal('');
  modo = signal<'CONFIRMAR' | 'MODIFICAR'>('CONFIRMAR');
  campoError = signal('');
  motivoError = signal('');
  guardando = signal(false);
  agendaId = 0;
  tagId = 0;

  ngOnInit() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('agendaId'));
    this.tagId = Number(this.route.snapshot.paramMap.get('tagId'));
    const capturaId = Number(this.route.snapshot.paramMap.get('capturaId'));
    if (!this.agendaId || !this.tagId || !capturaId) {
      this.router.navigate(['/home']);
      return;
    }

    const capturas = this.validacionState.capturas();
    const found = capturas.find((c) => c.id_conteo_det_c1 === capturaId);
    if (!found) {
      this.notification.error('Captura no encontrada');
      this.router.navigate(['/home']);
      return;
    }

    this.captura.set(found);
    this.c2Cantidad.set(found.c2_cantidad ?? found.c1_cantidad);
    if (found.estado === 'MODIFICADA' || found.estado === 'CONFIRMADA') {
      this.modo.set(found.estado === 'MODIFICADA' ? 'MODIFICAR' : 'CONFIRMAR');
    }
  }

  setModo(modo: 'CONFIRMAR' | 'MODIFICAR') {
    this.modo.set(modo);
    this.campoError.set('');
    this.motivoError.set('');
    if (modo === 'CONFIRMAR') {
      this.c2Cantidad.set(this.captura()?.c1_cantidad ?? null);
      this.motivo.set('');
    } else {
      this.c2Cantidad.set(this.captura()?.c2_cantidad ?? this.captura()?.c1_cantidad ?? null);
    }
  }

  onCantidadInput(event: CustomEvent<{ value?: string | number | null }>) {
    const raw = event.detail.value;
    const asString = raw === null || raw === undefined ? '' : String(raw).trim();
    const digits = asString.replace(/[^\d.]/g, '');
    if (digits.length > 7) {
      const limited = digits.slice(0, 7);
      this.c2Cantidad.set(limited === '' ? null : Number(limited));
      return;
    }
    this.c2Cantidad.set(asString === '' || asString === '.' ? null : Number(digits));
    if (this.campoError()) this.campoError.set('');
  }

  onMotivoInput(event: CustomEvent<{ value?: string | null }>) {
    this.motivo.set(event.detail.value ?? '');
    if (this.motivoError()) this.motivoError.set('');
  }

  guardar() {
    const captura = this.captura();
    if (!captura || this.guardando()) return;

    this.campoError.set('');
    this.motivoError.set('');

    if (this.modo() === 'CONFIRMAR') {
      this.validacionState.confirmarCaptura(captura.id_conteo_det_c1);
    } else {
      const cantidad = this.c2Cantidad();
      if (cantidad === null || Number.isNaN(cantidad) || cantidad < 0) {
        this.campoError.set('Ingresa una cantidad válida (máx. 7 dígitos)');
        return;
      }
      if (!this.motivo().trim()) {
        this.motivoError.set('Ingresa un motivo de modificación');
        return;
      }
      this.validacionState.modificarCaptura(captura.id_conteo_det_c1, cantidad, this.motivo().trim());
    }

    this.guardando.set(true);
    const allCapturas = this.validacionState.capturas();
    const resultado: ValidationResult = {
      agenda_id: this.agendaId,
      tag_id: this.tagId,
      login: 'APP_TABLET',
      capturas: allCapturas.map((c) => ({
        id_conteo_det_c1: c.id_conteo_det_c1,
        id_producto: c.id_producto,
        decision: c.estado === 'MODIFICADA' ? 'MODIFICAR' as const : 'CONFIRMAR' as const,
        c2_cantidad: c.c2_cantidad ?? undefined,
        motivo: c.motivo ?? undefined,
      })),
    };

    this.validacionRepo.guardarValidacion(resultado).subscribe({
      next: () => {
        this.guardando.set(false);
        this.notification.success(this.modo() === 'CONFIRMAR' ? 'Captura confirmada' : 'Captura modificada');
        this.router.navigate(['/agenda', this.agendaId, 'tag', this.tagId]);
      },
      error: (err) => {
        this.guardando.set(false);
        this.notification.error(err?.message || 'Error al guardar. Intente nuevamente.');
      },
    });
  }

  goBack() {
    if (this.tagId && this.agendaId) {
      this.router.navigate(['/agenda', this.agendaId, 'tag', this.tagId]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
