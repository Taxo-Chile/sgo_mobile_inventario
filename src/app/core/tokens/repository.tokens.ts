import { InjectionToken } from '@angular/core';
import { AuthRepository } from '../../domain/auth/repositories/auth.repository';
import { AgendaRepository } from '../../domain/agenda/repositories/agenda.repository';
import { ValidacionRepository } from '../../domain/validacion/repositories/validacion.repository';

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository');
export const AGENDA_REPOSITORY = new InjectionToken<AgendaRepository>('AgendaRepository');
export const VALIDACION_REPOSITORY = new InjectionToken<ValidacionRepository>('ValidacionRepository');
