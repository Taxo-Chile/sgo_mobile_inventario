import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { PreVarianceState } from '../../state/pre-variance/pre-variance.state';
import { PreVarianceService } from './services/pre-variance.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';
import { PreVarianceProducto } from '../../domain/pre-variance/models/pre-variance.model';

@Component({
  selector: 'app-pre-variance',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './pre-variance.page.html',
  styleUrls: ['./pre-variance.page.scss'],
})
export class PreVariancePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private preVarianceState = inject(PreVarianceState);
  private preVarianceService = inject(PreVarianceService);
  private notification = inject(NotificationService);
  private modalCtrl = inject(ModalController);

  private agendaId = 0;
  guardando = signal(false);

  preVariance = this.preVarianceState.preVariance;
  productos = this.preVarianceState.productos;
  loading = this.preVarianceState.loading;
  totalPendientes = this.preVarianceState.totalPendientes;
  totalAprobados = this.preVarianceState.totalAprobados;
  totalRechazados = this.preVarianceState.totalRechazados;
  montoTotalDiferencia = this.preVarianceState.montoTotalDiferencia;
  puedeFinalizar = this.preVarianceState.puedeFinalizar;
  estaFinalizado = this.preVarianceState.estaFinalizado;
  estadoCierre = this.preVarianceState.estadoCierre;
  fechaCierre = this.preVarianceState.fechaCierre;

  ngOnInit() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.agendaId) {
      this.router.navigate(['/home']);
      return;
    }

    this.preVarianceState.setLoading(true);
    this.preVarianceService.getDetalle(this.agendaId).subscribe({
      next: (data) => {
        const first = data.pre_variances?.[0] ?? null;
        this.preVarianceState.setPreVariance(
          first,
          data.productos,
          data.estado_cierre,
          data.fecha_cierre
        );
        this.preVarianceState.setLoading(false);
      },
      error: (err) => {
        this.notification.error(err.message);
        this.router.navigate(['/home']);
      },
    });
  }

  aprobarProducto(producto: PreVarianceProducto) {
    this.preVarianceState.aprobarProducto(producto.id);
    this.notification.success(`${producto.producto_nombre} aprobado`);
  }

  rechazarProducto(producto: PreVarianceProducto) {
    this.preVarianceState.rechazarProducto(producto.id, 'Rechazado por auditor');
    this.notification.success(`${producto.producto_nombre} rechazado`);
  }

  async confirmarFinalizacion() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Confirmar Pre Variance';
    alert.message = '¿Está seguro de finalizar la validación Pre Variance? Esta acción no se puede deshacer.';
    alert.buttons = [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Confirmar',
        role: 'confirm',
        handler: () => this.finalizarValidacion(),
      },
    ];
    document.body.appendChild(alert);
    await alert.present();
  }

  finalizarValidacion() {
    const pv = this.preVariance();
    if (!pv || !this.agendaId) return;

    this.guardando.set(true);

    const productosGuardados = this.productos()
      .filter((p) => p.estado !== 'PENDIENTE')
      .map((p) => ({
        id_producto: p.id_producto,
        id_tag: p.id_tag,
        decision: p.estado as 'APROBADO' | 'RECHAZADO',
        cantidad: p.estado === 'APROBADO' ? p.cantidad_c2 : p.cantidad_c1,
        motivo: p.motivo,
      }));

    this.preVarianceService.guardar(this.agendaId, productosGuardados).subscribe({
      next: (result) => {
        this.guardando.set(false);
        if (result) {
          this.notification.success('Pre Variance guardado correctamente');
          this.router.navigate(['/agenda', this.agendaId]);
        } else {
          this.notification.error('Error al guardar Pre Variance');
        }
      },
      error: (err) => {
        this.guardando.set(false);
        this.notification.error(err.message);
      },
    });
  }

  goBack() {
    this.router.navigate(['/agenda', this.agendaId]);
  }
}
