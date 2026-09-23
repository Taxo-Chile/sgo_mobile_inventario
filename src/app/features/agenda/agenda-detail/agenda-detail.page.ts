import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { AGENDA_REPOSITORY } from '../../../core/tokens/repository.tokens';
import { AgendaRepository } from '../../../domain/agenda/repositories/agenda.repository';
import { AgendaState } from '../../../state/agenda/agenda.state';
import { ValidacionState } from '../../../state/validacion/validacion.state';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../../shared/components/connectivity-banner/connectivity-banner.component';
import { Agenda, TagResumen } from '../../../domain/agenda/models/agenda.model';
import { BusinessRulesService, BusinessRuleResult } from '../../../shared/services/business-rules.service';

@Component({
  selector: 'app-agenda-detail',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, DatePipe],
  templateUrl: './agenda-detail.page.html',
  styleUrls: ['./agenda-detail.page.scss'],
})
export class AgendaDetailPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agendaRepo = inject<AgendaRepository>(AGENDA_REPOSITORY);
  private agendaState = inject(AgendaState);
  private validacionState = inject(ValidacionState);
  private notification = inject(NotificationService);
  private businessRules = inject(BusinessRulesService);

  agenda = signal<Agenda | null>(null);
  tags = signal<TagResumen[]>([]);
  loading = signal(true);
  rules = signal<BusinessRuleResult | null>(null);
  agendaId = 0;

  ionViewWillEnter() {
    this.agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.agendaId) {
      this.router.navigate(['/home']);
      return;
    }

    this.loading.set(true);

    this.agendaRepo.getAgendaDetalle(this.agendaId).subscribe({
      next: (detalle) => {
        this.agenda.set(detalle.agenda);
        this.agendaState.setTags(detalle.tags);
        this.tags.set(detalle.tags);
        this.rules.set(this.businessRules.evaluar(detalle.tags));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Error al cargar agenda');
      },
    });
  }

  openTag(tag: TagResumen) {
    if (tag.estado === 'ANULADO') {
      this.notification.info('TAG anulado - No se puede validar');
      return;
    }
    this.validacionState.clear();
    this.router.navigate(['/agenda', this.agendaId, 'tag', tag.id]);
  }

  openPreVariance() {
    const agenda = this.agenda();
    if (!agenda) return;
    this.router.navigate(['/pre-variance', agenda.id]);
  }

  openRecuento() {
    const agenda = this.agenda();
    if (!agenda) return;
    this.router.navigate(['/recuento', agenda.id]);
  }

  openCierres() {
    const agenda = this.agenda();
    if (!agenda) return;
    this.router.navigate(['/cierres', agenda.id]);
  }

  openZonificacion() {
    const agenda = this.agenda();
    if (!agenda) return;
    this.router.navigate(['/zonificacion', agenda.id]);
  }

  openInformes() {
    const agenda = this.agenda();
    if (!agenda) return;
    this.router.navigate(['/informes', agenda.id]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
