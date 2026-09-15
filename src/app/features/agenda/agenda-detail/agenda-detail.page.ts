import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AgendaState } from '../../../state/agenda/agenda.state';
import { ValidacionState } from '../../../state/validacion/validacion.state';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../../shared/components/connectivity-banner/connectivity-banner.component';
import { TagResumen } from '../../../domain/agenda/models/agenda.model';

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
  private agendaState = inject(AgendaState);
  private validacionState = inject(ValidacionState);
  private notification = inject(NotificationService);

  agenda = this.agendaState.selectedAgenda;
  tags = this.agendaState.tags;
  loading = this.agendaState.loading;

  ngOnInit() {
    const agendaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!agendaId) {
      this.router.navigate(['/home']);
      return;
    }
    // TODO: Load tags from API
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
