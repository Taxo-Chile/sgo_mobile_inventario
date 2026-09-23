import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { AuthState } from '../../state/auth/auth.state';
import { GetAgendasUseCase } from '../../application/agenda/get-agendas.usecase';
import { AgendaState } from '../../state/agenda/agenda.state';
import { NotificationService } from '../../shared/services/notification.service';
import { ConnectivityBannerComponent } from '../../shared/components/connectivity-banner/connectivity-banner.component';
import { ThemeState } from '../../state/theme/theme.state';
import { Agenda } from '../../domain/agenda/models/agenda.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, ConnectivityBannerComponent, DatePipe],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private router = inject(Router);
  menu = inject(MenuController);
  private authState = inject(AuthState);
  private getAgendas = inject(GetAgendasUseCase);
  private agendaState = inject(AgendaState);
  private notification = inject(NotificationService);
  private themeState = inject(ThemeState);

  user = this.authState.user;
  agendas = this.agendaState.agendas;
  loading = this.agendaState.loading;
  isDark = this.themeState.isDark;

  selectedDate = signal<string>(this.getToday());
  selectedTienda = signal<string>('Todos');

  tiendas = computed(() => {
    const all = this.agendas();
    const names = [...new Set(all.map(a => a.tienda_nombre))];
    return names.sort();
  });

  filteredAgendas = computed(() => {
    const date = this.selectedDate();
    const tienda = this.selectedTienda();
    let result = this.agendas();

    if (date) {
      result = result.filter(a => a.fecha === date);
    }

    if (tienda && tienda !== 'Todos') {
      result = result.filter(a => a.tienda_nombre === tienda);
    }

    return result;
  });

  ngOnInit() {
    this.loadAgendas();
  }

  loadAgendas() {
    const rut = this.authState.getUserRut();
    this.getAgendas.execute(rut).subscribe({
      error: (err) => this.notification.error(err.message),
    });
  }

  onDateChange(event: any) {
    const value = event.detail?.value || event.target?.value;
    if (value) {
      this.selectedDate.set(value);
    }
  }

  onTiendaChange(event: any) {
    this.selectedTienda.set(event.detail?.value);
  }

  openAgenda(agenda: Agenda) {
    this.agendaState.selectAgenda(agenda);
    this.router.navigate(['/agenda', agenda.id]);
  }

  openMenu() {
    this.menu.open('main-menu');
  }

  async toggleTheme(): Promise<void> {
    await this.themeState.toggle();
  }

  logout() {
    this.authState.clearUser();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
