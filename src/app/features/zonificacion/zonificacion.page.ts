import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ZonificacionState } from '../../state/zonificacion/zonificacion.state';
import { ZonificacionService } from './services/zonificacion.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-zonificacion',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, DecimalPipe, DatePipe],
  templateUrl: './zonificacion.page.html',
  styleUrls: ['./zonificacion.page.scss'],
})
export class ZonificacionPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zonificacionState = inject(ZonificacionState);
  private zonificacionService = inject(ZonificacionService);
  private notification = inject(NotificationService);

  agenda = this.zonificacionState.agenda;
  kpi = this.zonificacionState.kpi;
  zonas = this.zonificacionState.zonas;
  tagsFueraZona = this.zonificacionState.tagsFueraZona;
  observaciones = this.zonificacionState.observaciones;
  loading = this.zonificacionState.loading;
  error = this.zonificacionState.error;
  tienePendientes = this.zonificacionState.tienePendientes;
  tieneTagsFuera = this.zonificacionState.tieneTagsFuera;

  ngOnInit() {
    const agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!agendaId) {
      this.router.navigate(['/home']);
      return;
    }

    this.zonificacionState.setLoading(true);
    this.zonificacionService.getDetalle(agendaId).subscribe({
      next: (data) => {
        this.zonificacionState.setData(data);
        this.zonificacionState.setLoading(false);
      },
      error: (err) => {
        this.notification.error(err.message);
        this.router.navigate(['/home']);
      },
    });
  }

  getPorcentajeColor(porcentaje: number): string {
    if (porcentaje >= 100) return 'success';
    if (porcentaje >= 70) return 'warning';
    return 'danger';
  }

  goBack() {
    const agendaId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/agenda', agendaId]);
  }

  downloadExcel() {
    const agendaId = this.route.snapshot.paramMap.get('id');
    if (!agendaId) return;
    window.open(`${environment.apiUrl}/tablet/zonificacion/excel.php?agenda_id=${agendaId}`, '_blank');
  }

  downloadPdf() {
    const agendaId = this.route.snapshot.paramMap.get('id');
    if (!agendaId) return;
    window.open(`${environment.apiUrl}/tablet/zonificacion/pdf.php?agenda_id=${agendaId}`, '_blank');
  }
}
