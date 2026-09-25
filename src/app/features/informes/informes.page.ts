import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '../../core/http/http-client';
import { InformesService, InformeItem } from './services/informes.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './informes.page.html',
  styleUrls: ['./informes.page.scss'],
})
export class InformesPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private informesService = inject(InformesService);
  private notification = inject(NotificationService);
  private http = inject(HttpClient);

  allInformes = this.informesService.INFORMES;
  informes: InformeItem[] = [];
  agendaId = 0;
  loading = false;
  loadingEstado = true;
  informeActual: string | null = null;
  datosInforme: any = null;
  enviandoCorreo = false;
  emailDestinatarios = '';

  ngOnInit() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.agendaId) {
      this.router.navigate(['/home']);
      return;
    }
    this.cargarEstadoInformes();
  }

  private async cargarEstadoInformes() {
    this.loadingEstado = true;
    try {
      const res: any = await this.http.get(`tablet/informes/ejecutivo.php?agenda_id=${this.agendaId}`);
      const data = res?.data ?? res;
      const capturas = data?.capturas ?? {};
      const etapas = data?.etapas ?? {};
      const tieneC1 = (capturas.c1 ?? 0) > 0;
      const tieneC2 = (capturas.c2 ?? 0) > 0;
      const tienePreVariance = etapas.pre_variance != null;
      const tieneSnapshot = etapas.cierre_final != null;

      this.informes = this.allInformes.filter((inf) => {
        switch (inf.id) {
          case 'ejecutivo':
            return true;
          case 'captura-final':
            return tieneC1;
          case 'validacion-tag':
            return tieneC2;
          case 'prevariance':
            return tienePreVariance;
          case 'cierre-final':
            return tieneSnapshot;
          default:
            return true;
        }
      });
    } catch {
      this.informes = this.allInformes.filter((inf) => inf.id === 'ejecutivo');
    } finally {
      this.loadingEstado = false;
    }
  }

  seleccionarInforme(informe: InformeItem) {
    this.informeActual = informe.id;
    this.datosInforme = null;
    this.loading = true;

    this.informesService.getInforme(informe.id, this.agendaId).subscribe({
      next: (data) => {
        this.datosInforme = data?.data ?? data;
        this.loading = false;
      },
      error: (err) => {
        this.notification.error(err.message || 'Error al cargar informe');
        this.loading = false;
        this.informeActual = null;
      },
    });
  }

  volver() {
    this.informeActual = null;
    this.datosInforme = null;
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  getEstadoColor(estado: string): string {
    const colors: Record<string, string> = {
      OK: 'success',
      ALTERADO: 'danger',
      INCOMPLETO: 'warning',
      CONFORME: 'success',
      DIFERENCIA: 'warning',
      CONFIRMADO: 'success',
      MODIFICADO: 'warning',
      PENDIENTE: 'medium',
      CERRADO: 'success',
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

  async enviarCorreo() {
    const emails = this.emailDestinatarios
      .split(/[;,]/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    if (emails.length === 0) {
      this.notification.error('Ingrese al menos un correo valido');
      return;
    }

    this.enviandoCorreo = true;
    const payload = {
      agenda_id: this.agendaId,
      destinatarios: emails.map(e => ({ email: e })),
    };

    try {
      const res: any = await this.http.post('tablet/cierres/envio.php', payload);
      this.enviandoCorreo = false;
      this.notification.success(`Correo enviado a ${res.enviados} destinatario(s)`);
      this.emailDestinatarios = '';
    } catch (err: any) {
      this.enviandoCorreo = false;
      this.notification.error(err.message || 'Error de conexion');
    }
  }
}
