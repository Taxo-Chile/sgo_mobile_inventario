import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CierresService } from './services/cierres.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';

interface CierreInfo {
  tipo: string;
  label: string;
  icon: string;
  estado: string;
  estadoLabel: string;
  fecha?: string;
  cerradoPor?: string;
  observaciones?: string;
}

interface SnapshotInfo {
  existe: boolean;
  codigo?: string;
  fecha?: string;
  stockUnidades?: number;
  fisicoUnidades?: number;
  diferenciaUnidades?: number;
  stockValor?: number;
  fisicoValor?: number;
  diferenciaValor?: number;
  hash?: string;
}

@Component({
  selector: 'app-cierres',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './cierres.page.html',
  styleUrls: ['./cierres.page.scss'],
})
export class CierresPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cierresService = inject(CierresService);
  private notification = inject(NotificationService);

  loading = signal(true);
  agendaId = 0;
  estadoAgenda = '';

  preVariance = signal<CierreInfo | null>(null);
  recuento = signal<CierreInfo | null>(null);
  snapshot = signal<SnapshotInfo>({ existe: false });

  ngOnInit() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.agendaId) {
      this.router.navigate(['/home']);
      return;
    }
    this.cargarEstado();
  }

  cargarEstado() {
    this.loading.set(true);
    this.cierresService.getDetalle(this.agendaId).subscribe({
      next: (data) => {
        this.estadoAgenda = data.estado_agenda || '';
        this.mapearCierres(data.cierres);
        this.mapearSnapshot(data.cierre_agenda);
        this.loading.set(false);
      },
      error: (err) => {
        this.notification.error(err.message || 'Error al cargar cierres');
        this.loading.set(false);
      },
    });
  }

  private mapearCierres(cierres: any[]) {
    let pv: CierreInfo | null = null;
    let rc: CierreInfo | null = null;

    for (const c of cierres) {
      const tipo = c.tipo_cierre || c.TIPO_CIERRE;
      if (tipo === 'PRE_VARIANCE') {
        pv = {
          tipo: 'PRE_VARIANCE',
          label: 'Pre Variance',
          icon: 'analytics-outline',
          estado: c.estado || c.estado_cierre || 'PENDIENTE',
          estadoLabel: this.getEstadoLabel(c.estado || c.estado_cierre),
          fecha: c.creado_at || c.fecha_confirmacion,
          cerradoPor: c.cerrado_por || c.login_confirmacion,
          observaciones: c.observaciones || c.observacion,
        };
      } else if (tipo === 'RECUENTO') {
        rc = {
          tipo: 'RECUENTO',
          label: 'Recuento',
          icon: 'calculator-outline',
          estado: c.estado_cierre || c.estado || 'PENDIENTE',
          estadoLabel: this.getEstadoLabel(c.estado_cierre || c.estado),
          fecha: c.fecha_hora_cierre || c.fecha_cierre,
          cerradoPor: c.login_cierre,
          observaciones: c.observacion,
        };
      }
    }

    this.preVariance.set(pv);
    this.recuento.set(rc);
  }

  private mapearSnapshot(snap: any) {
    if (!snap) {
      this.snapshot.set({ existe: false });
      return;
    }
    this.snapshot.set({
      existe: true,
      codigo: snap.codigo_cierre,
      fecha: snap.fecha_cierre,
      stockUnidades: Number(snap.total_stock_unidades) || 0,
      fisicoUnidades: Number(snap.total_fisico_unidades) || 0,
      diferenciaUnidades: Number(snap.total_diferencia_unidades) || 0,
      stockValor: Number(snap.total_valor_stock) || 0,
      fisicoValor: Number(snap.total_valor_fisico) || 0,
      diferenciaValor: (Number(snap.total_valor_stock) || 0) - (Number(snap.total_valor_fisico) || 0),
      hash: snap.hash_cabecera,
    });
  }

  private getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PENDIENTE_ENVIO: 'Pendiente',
      EN_CURSO: 'En Curso',
      CERRADO: 'Cerrado',
      ENVIADO: 'Enviado',
      COMPLETADO: 'Completado',
      ANULADO: 'Anulado',
    };
    return labels[estado] || estado || 'Sin datos';
  }

  getEstadoColor(estado: string): string {
    const colors: Record<string, string> = {
      CERRADO: 'success',
      ENVIADO: 'success',
      COMPLETADO: 'success',
      PENDIENTE: 'warning',
      PENDIENTE_ENVIO: 'warning',
      EN_CURSO: 'primary',
      ANULADO: 'danger',
    };
    return colors[estado] || 'medium';
  }

  downloadPdf() {
    window.open(`http://127.0.0.1:8088/api/tablet/cierres/export-pdf.php?agenda_id=${this.agendaId}`, '_blank');
  }

  downloadExcel() {
    window.open(`http://127.0.0.1:8088/api/tablet/cierres/export-excel.php?agenda_id=${this.agendaId}`, '_blank');
  }

  downloadZip() {
    window.open(`http://127.0.0.1:8088/api/tablet/cierres/export-zip.php?agenda_id=${this.agendaId}`, '_blank');
  }
}
