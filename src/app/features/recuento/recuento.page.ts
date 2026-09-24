import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { RecuentoState } from '../../state/recuento/recuento.state';
import { RecuentoService, PreviewResult, PreviewProducto } from './services/recuento.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';
import { RecuentoProducto } from '../../domain/recuento/models/recuento.model';

@Component({
  selector: 'app-recuento',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, DecimalPipe],
  templateUrl: './recuento.page.html',
  styleUrls: ['./recuento.page.scss'],
})
export class RecuentoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recuentoState = inject(RecuentoState);
  private recuentoService = inject(RecuentoService);
  private notification = inject(NotificationService);
  private alertCtrl = inject(AlertController);

  recuento = this.recuentoState.recuento;
  productos = this.recuentoState.productos;
  loading = this.recuentoState.loading;
  totalPendientes = this.recuentoState.totalPendientes;
  totalParciales = this.recuentoState.totalParciales;
  totalRecontados = this.recuentoState.totalRecontados;
  totalConfirmados = this.recuentoState.totalConfirmados;
  totalModificados = this.recuentoState.totalModificados;
  montoTotalDiferencia = this.recuentoState.montoTotalDiferencia;
  puedeFinalizar = this.recuentoState.puedeFinalizar;
  estaFinalizado = this.recuentoState.estaFinalizado;

  preview: PreviewResult | null = null;
  previewLoading = false;
  previewProductos: PreviewProducto[] = [];
  agendaId = 0;

  ngOnInit() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.agendaId) {
      this.router.navigate(['/home']);
      return;
    }

    this.recuentoState.setLoading(true);
    this.recuentoService.getDetalle(this.agendaId).subscribe({
      next: (data) => {
        const first = data.recuentos?.[0] ?? null;
        this.recuentoState.setRecuento(first, data.productos, data.estado_cierre);
        this.recuentoState.setLoading(false);
        this.loadPreview(this.agendaId);
      },
      error: (err) => {
        this.notification.error(err.message);
        this.router.navigate(['/home']);
      },
    });
  }

  loadPreview(agendaId: number) {
    this.previewLoading = true;
    this.recuentoService.getPreview(agendaId).subscribe({
      next: (data) => {
        this.preview = data;
        this.previewProductos = data?.productos ?? [];
        this.previewLoading = false;
      },
      error: () => {
        this.previewLoading = false;
      },
    });
  }

  confirmarProducto(producto: RecuentoProducto) {
    this.recuentoState.confirmarProducto(producto.id);
    this.notification.success(`${producto.producto_nombre} confirmado`);
  }

  async modificarProducto(producto: RecuentoProducto) {
    const cantidadC2 = Number(producto.cantidad_c2);
    const alert = await this.alertCtrl.create({
      header: `Modificar ${producto.producto_sku}`,
      message: `Ingrese la cantidad real contada (C3). C2 actual: ${cantidadC2}`,
      inputs: [
        {
          name: 'cantidad',
          type: 'number',
          placeholder: `Cantidad actual: ${cantidadC2}`,
          value: cantidadC2,
        },
        {
          name: 'motivo',
          type: 'text',
          placeholder: 'Motivo de la modificación',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          cssClass: 'primary',
          handler: (data) => {
            const raw = String(data.cantidad ?? '').trim();
            if (raw.length > 7) {
              this.notification.error('La cantidad no puede superar 7 dígitos');
              return false;
            }
            const nuevaCantidad = parseFloat(raw);
            const motivo = (data.motivo || '').trim();

            if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
              this.notification.error('Ingrese una cantidad válida (máx. 7 dígitos)');
              return false;
            }

            if (!motivo || motivo.length < 3) {
              this.notification.error('Ingrese un motivo (mínimo 3 caracteres)');
              return false;
            }

            this.recuentoState.modificarProducto(producto.id, nuevaCantidad, motivo);
            this.notification.success(`${producto.producto_nombre} modificado a ${nuevaCantidad}`);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async finalizarRecuento() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Está seguro que desea finalizar el Recuento? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Finalizar',
          role: 'confirm',
          handler: () => {
            this.ejecutarFinalizacion();
          },
        },
      ],
    });

    await alert.present();
  }

  private ejecutarFinalizacion() {
    const agendaId = this.agendaId;

    // Universo: productos con al menos un C3 capturado.
    // fl_corrige según diferencia real vs base (réplica ScriptCase corregir).
    const productosValidados = this.productos()
      .filter((p) => p.cantidad_c3 !== null)
      .map((p) => {
        const base = Number(p.base_quantity ?? p.cantidad_c2 ?? 0);
        const c3 = Number(p.cantidad_c3 ?? 0);
        const corrige = Math.abs(c3 - base) > 0.0005;
        return {
          producto_id: p.id,
          cantidad_c3: c3,
          fl_corrige: (corrige ? 'S' : 'N') as 'S' | 'N',
        };
      });

    this.recuentoService.validar(agendaId, productosValidados).subscribe({
      next: () => {
        this.notification.success('Recuento finalizado correctamente');
        this.router.navigate(['/agenda', this.agendaId]);
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
