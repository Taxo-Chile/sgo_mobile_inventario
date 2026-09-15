import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { AuthState } from '../../state/auth/auth.state';
import { GetAgendasUseCase } from '../../application/agenda/get-agendas.usecase';
import { AgendaState } from '../../state/agenda/agenda.state';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private router = inject(Router);
  private menu = inject(MenuController);
  private authState = inject(AuthState);
  private getAgendas = inject(GetAgendasUseCase);
  private agendaState = inject(AgendaState);
  private notification = inject(NotificationService);

  user = this.authState.user;
  agendas = this.agendaState.agendas;
  loading = this.agendaState.loading;

  ngOnInit() {
    this.loadAgendas();
  }

  loadAgendas() {
    const rut = this.authState.getUserRut();
    this.getAgendas.execute(rut).subscribe({
      error: (err) => this.notification.error(err.message),
    });
  }

  openAgenda(agenda: any) {
    this.agendaState.selectAgenda(agenda);
    this.router.navigate(['/agenda', agenda.id]);
  }

  openMenu() {
    this.menu.open('main-menu');
  }

  logout() {
    this.authState.clearUser();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
