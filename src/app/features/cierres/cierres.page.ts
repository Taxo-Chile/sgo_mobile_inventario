import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CierreState } from '../../state/cierre/cierre.state';
import { CierresService } from './services/cierres.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';
import { Cierre } from '../../domain/cierre/models/cierre.model';

@Component({
  selector: 'app-cierres',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, CurrencyPipe],
  templateUrl: './cierres.page.html',
  styleUrls: ['./cierres.page.scss'],
})
export class CierresPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cierreState = inject(CierreState);
  private cierresService = inject(CierresService);
  private notification = inject(NotificationService);

  cierres = this.cierreState.cierres;
  loading = this.cierreState.loading;
  cierresPendientes = this.cierreState.cierresPendientes;
  cierresCompletados = this.cierreState.cierresCompletados;
  puedeCerrarFinal = this.cierreState.puedeCerrarFinal;

  agendaId = 0;

  ngOnInit() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.agendaId) {
      this.router.navigate(['/home']);
      return;
    }

    this.cierreState.setLoading(true);
    this.cierresService.getEstado(this.agendaId).subscribe({
      next: (data) => {
        this.cierreState.setCierres(data.cierres);
        this.cierreState.setLoading(false);
      },
      error: (err) => {
        this.notification.error(err.message);
        this.router.navigate(['/home']);
      },
    });
  }

  cerrarCierre(cierre: Cierre) {
    if (cierre.estado === 'COMPLETADO') return;

    this.cierresService.cerrar(cierre.id).subscribe({
      next: () => {
        this.cierreState.actualizarCierre({
          ...cierre,
          estado: 'COMPLETADO',
          cerrado_at: new Date().toISOString(),
        });
        this.notification.success(`Cierre ${cierre.tipo_cierre} completado`);
      },
      error: (err) => {
        this.notification.error(err.message);
      },
    });
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      PRE_VARIANCE: 'Pre Variance',
      RECUENTO: 'Recuento',
      FINAL: 'Final',
    };
    return labels[tipo] || tipo;
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      PRE_VARIANCE: 'analytics-outline',
      RECUENTO: 'calculator-outline',
      FINAL: 'lock-closed-outline',
    };
    return icons[tipo] || 'document-outline';
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
