import { InjectionToken } from '@angular/core';
import { AuthRepository } from '../../domain/auth/repositories/auth.repository';
import { AgendaRepository } from '../../domain/agenda/repositories/agenda.repository';
import { ValidacionRepository } from '../../domain/validacion/repositories/validacion.repository';
import {
  ActualizacionApiRepository,
  DescargaRepository,
  InstaladorRepository,
} from '../../domain/actualizacion/repositories/actualizacion.repository';

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository');
export const AGENDA_REPOSITORY = new InjectionToken<AgendaRepository>('AgendaRepository');
export const VALIDACION_REPOSITORY = new InjectionToken<ValidacionRepository>('ValidacionRepository');

/*
 * La autoactualización se inyecta por estas tres, igual que el resto de las
 * repositorios de la app. Van las tres juntas porque ninguna tiene sentido sin
 * las otras: consultar sin poder instalar sólo serviría para mostrar un aviso
 * que no se puede atender.
 */
export const ACTUALIZACION_API_REPOSITORY =
  new InjectionToken<ActualizacionApiRepository>('ActualizacionApiRepository');
export const DESCARGA_REPOSITORY = new InjectionToken<DescargaRepository>('DescargaRepository');
export const INSTALADOR_REPOSITORY = new InjectionToken<InstaladorRepository>('InstaladorRepository');
