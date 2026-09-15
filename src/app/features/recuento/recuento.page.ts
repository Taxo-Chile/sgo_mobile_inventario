import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RecuentoState } from '../../state/recuento/recuento.state';
import { RecuentoService } from './services/recuento.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';
import { RecuentoProducto } from '../../domain/recuento/models/recuento.model';

@Component({
  selector: 'app-recuento',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, CurrencyPipe],
  templateUrl: './recuento.page.html',
  styleUrls: ['./recuento.page.scss'],
})
export class RecuentoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recuentoState = inject(RecuentoState);
  private recuentoService = inject(RecuentoService);
  private notification = inject(NotificationService);

  recuento = this.recuentoState.recuento;
  productos = this.recuentoState.productos;
  loading = this.recuentoState.loading;
  totalPendientes = this.recuentoState.totalPendientes;
  totalConfirmados = this.recuentoState.totalConfirmados;
  totalModificados = this.recuentoState.totalModificados;
  montoTotalDiferencia = this.recuentoState.montoTotalDiferencia;
  puedeFinalizar = this.recuentoState.puedeFinalizar;

  ngOnInit() {
    const agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!agendaId) {
      this.router.navigate(['/home']);
      return;
    }

    this.recuentoState.setLoading(true);
    this.recuentoService.getDetalle(agendaId).subscribe({
      next: (data) => {
        const first = data.recuentos?.[0] ?? null;
        this.recuentoState.setRecuento(first, data.productos);
        this.recuentoState.setLoading(false);
      },
      error: (err) => {
        this.notification.error(err.message);
        this.router.navigate(['/home']);
      },
    });
  }

  confirmarProducto(producto: RecuentoProducto) {
    this.recuentoState.confirmarProducto(producto.id);
    this.notification.success(`${producto.producto_nombre} confirmado`);
  }

  modificarProducto(producto: RecuentoProducto) {
    this.recuentoState.modificarProducto(producto.id, producto.cantidad_c2, 'Modificado por auditor');
    this.notification.success(`${producto.producto_nombre} modificado`);
  }

  finalizarRecuento() {
    const rec = this.recuento();
    if (!rec) return;

    const productosValidados = this.productos()
      .filter((p) => p.estado !== 'PENDIENTE')
      .map((p) => ({
        producto_id: p.id,
        estado: p.estado,
        cantidad_c3: p.cantidad_c3,
        motivo: p.motivo_modificacion,
      }));

    this.recuentoService.validar(rec.id, productosValidados).subscribe({
      next: () => {
        this.notification.success('Recuento finalizado correctamente');
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
