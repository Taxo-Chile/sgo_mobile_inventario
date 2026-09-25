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
import { OfertaActualizacionService } from '../../shared/services/oferta-actualizacion.service';
import { APP_VERSION } from '../../core/version';
import { AppInfoService } from '../../core/app-info.service';

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
  private oferta = inject(OfertaActualizacionService);
  private appInfo = inject(AppInfoService);

  user = this.authState.user;
  agendas = this.agendaState.agendas;
  loading = this.agendaState.loading;
  isDark = this.themeState.isDark;

  /*
   * Versión mostrada en el menú lateral.
   *
   * Arranca con APP_VERSION para no dejar el texto vacío en el navegador, y en
   * ngOnInit se reemplaza por la que reporta Android. Es la misma pregunta que
   * hace la autoactualización: si el operador actualizó a 0.1.1, el menú tiene
   * que decir 0.1.1 aunque el build se haya hecho con otra constante.
   */
  appVersion = APP_VERSION;

  /*
   * Versión nueva para ofrecer. La consulta se dispara al entrar a esta
   * pantalla —ver ionViewWillEnter— porque en Inicio nunca hay un recuento
   * abierto: la app se CIERRA para instalarse, y ofrecerlo a mitad de un conteo
   * sería ofrecerle al operador perder el hilo.
   */
  hayVersionNueva = this.oferta.ofrecible;
  versionDisponible = this.oferta.disponible;
  descargandoVersion = this.oferta.descargando;
  porcentajeVersion = this.oferta.porcentaje;
  buscandoActualizacion = this.oferta.buscando;

  ofrecerActualizacion(): void {
    void this.oferta.ofrecer();
  }

  descartarActualizacion(): void {
    this.oferta.descartar();
  }

  /*
   * Botón del menú. A diferencia de la consulta silenciosa, acá se contesta
   * siempre —aunque no haya nada nuevo—: el operador tocó un botón y se quedó
   * mirando, y no decirle nada es dejarlo sin saber si funcionó.
   */
  buscarActualizacion(): void {
    void this.oferta.buscarYResponder();
  }

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
    void this.appInfo.version().then((v) => (this.appVersion = v.nombre));
  }

  /*
   * Se consulta por versión nueva ACÁ y no en el arranque de la app: entrar a
   * Inicio es la señal de que el operador no está contando. El servicio espacia
   * las consultas (5 minutos), así que entrar y salir varias veces no le pega al
   * servidor cada vez.
   *
   * Sin await y sin catch: si falla, no se ofrece nada y listo. Una consulta de
   * versión no puede demorar ni romper la carga de la pantalla.
   */
  ionViewWillEnter(): void {
    void this.oferta.buscarEnSilencio();
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
