import { Observable } from 'rxjs';
import { Agenda, AgendaDetalle, TagResumen } from '../models/agenda.model';

export abstract class AgendaRepository {
  abstract getAgendasPorAuditor(auditorRut: string): Observable<Agenda[]>;
  abstract getAgendaDetalle(agendaId: number): Observable<AgendaDetalle>;
  abstract getTagsPorAgenda(agendaId: number): Observable<TagResumen[]>;
  abstract checkin(agendaId: number, lat?: number, lng?: number): Observable<void>;
  abstract checkout(agendaId: number, lat?: number, lng?: number): Observable<void>;
}
