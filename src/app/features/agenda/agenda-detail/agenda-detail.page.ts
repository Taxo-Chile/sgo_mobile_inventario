import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AGENDA_REPOSITORY } from '../../../core/tokens/repository.tokens';
import { AgendaRepository } from '../../../domain/agenda/repositories/agenda.repository';
import { AgendaState } from '../../../state/agenda/agenda.state';
import { ValidacionState } from '../../../state/validacion/validacion.state';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../../shared/components/connectivity-banner/connectivity-banner.component';
import { Agenda, TagResumen } from '../../../domain/agenda/models/agenda.model';

@Component({
  selector: 'app-agenda-detail',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent],
  templateUrl: './agenda-detail.page.html',
  styleUrls: ['./agenda-detail.page.scss'],
})
export class AgendaDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agendaRepo = inject<AgendaRepository>(AGENDA_REPOSITORY);
  private agendaState = inject(AgendaState);
  private validacionState = inject(ValidacionState);
  private notification = inject(NotificationService);

  agenda = signal<Agenda | null>(null);
  tags = signal<TagResumen[]>([]);
  loading = signal(true);

  ngOnInit() {
    const agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!agendaId) {
      this.router.navigate(['/home']);
      return;
    }

    const selected = this.agendaState.selectedAgenda();
    if (selected && selected.id === agendaId) {
      this.agenda.set(selected);
      this.loadTags(agendaId);
    } else {
      this.agendaRepo.getAgendaDetalle(agendaId).subscribe({
        next: (detalle) => {
          this.agenda.set(detalle.agenda);
          this.agendaState.setTags(detalle.tags);
          this.tags.set(detalle.tags);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Error al cargar agenda');
        },
      });
    }
  }

  private loadTags(agendaId: number) {
    this.agendaRepo.getTagsPorAgenda(agendaId).subscribe({
      next: (tags) => {
        this.agendaState.setTags(tags);
        this.tags.set(tags);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openTag(tag: TagResumen) {
    if (tag.estado === 'ANULADO') {
      this.notification.info('TAG anulado - No se puede validar');
      return;
    }
    this.validacionState.clear();
    this.router.navigate(['/tag', tag.id]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
