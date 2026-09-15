import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PreVarianceState } from '../../state/pre-variance/pre-variance.state';
import { PreVarianceService } from './services/pre-variance.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';
import { PreVarianceProducto } from '../../domain/pre-variance/models/pre-variance.model';

@Component({
  selector: 'app-pre-variance',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, CurrencyPipe],
  templateUrl: './pre-variance.page.html',
  styleUrls: ['./pre-variance.page.scss'],
})
export class PreVariancePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private preVarianceState = inject(PreVarianceState);
  private preVarianceService = inject(PreVarianceService);
  private notification = inject(NotificationService);

  preVariance = this.preVarianceState.preVariance;
  productos = this.preVarianceState.productos;
  loading = this.preVarianceState.loading;
  totalPendientes = this.preVarianceState.totalPendientes;
  totalAprobados = this.preVarianceState.totalAprobados;
  totalRechazados = this.preVarianceState.totalRechazados;
  montoTotalDiferencia = this.preVarianceState.montoTotalDiferencia;
  puedeFinalizar = this.preVarianceState.puedeFinalizar;

  ngOnInit() {
    const agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!agendaId) {
      this.router.navigate(['/home']);
      return;
    }

    this.preVarianceState.setLoading(true);
    this.preVarianceService.getDetalle(agendaId).subscribe({
      next: (data) => {
        const first = data.pre_variances?.[0] ?? null;
        this.preVarianceState.setPreVariance(first, data.productos);
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

  finalizarValidacion() {
    const pv = this.preVariance();
    if (!pv) return;

    const productosValidados = this.productos()
      .filter((p) => p.estado !== 'PENDIENTE')
      .map((p) => ({
        producto_id: p.id,
        estado: p.estado,
        motivo: p.motivo,
      }));

    this.preVarianceService.validar(pv.id, productosValidados).subscribe({
      next: () => {
        this.notification.success('Pre Variance validado correctamente');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.notification.error(err.message);
      },
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
