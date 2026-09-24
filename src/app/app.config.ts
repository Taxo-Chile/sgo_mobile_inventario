import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { registerLocaleData } from '@angular/common';
import localeEsCL from '@angular/common/locales/es-CL';
import { routes } from './app.routes';
import {
  AUTH_REPOSITORY,
  AGENDA_REPOSITORY,
  VALIDACION_REPOSITORY,
  ACTUALIZACION_API_REPOSITORY,
  DESCARGA_REPOSITORY,
  INSTALADOR_REPOSITORY,
} from './core/tokens/repository.tokens';
import { AuthApiRepository } from './data/auth/auth-api.repository';
import { AgendaApiRepository } from './data/agenda/agenda-api.repository';
import { ValidacionApiRepository } from './data/validacion/validacion-api.repository';
import { ActualizacionApiService } from './data/actualizacion/actualizacion-api.service';
import { CapacitorDescargaService } from './data/actualizacion/descarga.service';
import { CapacitorInstaladorService } from './data/actualizacion/instalador.service';

registerLocaleData(localeEsCL, 'es-CL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular({
      mode: 'md',
    }),
    { provide: LOCALE_ID, useValue: 'es-CL' },
    { provide: AUTH_REPOSITORY, useClass: AuthApiRepository },
    { provide: AGENDA_REPOSITORY, useClass: AgendaApiRepository },
    { provide: VALIDACION_REPOSITORY, useClass: ValidacionApiRepository },
    { provide: ACTUALIZACION_API_REPOSITORY, useClass: ActualizacionApiService },
    { provide: DESCARGA_REPOSITORY, useClass: CapacitorDescargaService },
    { provide: INSTALADOR_REPOSITORY, useClass: CapacitorInstaladorService },
  ],
};
