import { Observable } from 'rxjs';
import { Agenda, AgendaDetalle, TagResumen } from '../models/agenda.model';

export interface AgendaRepository {
  getAgendasPorAuditor(auditorRut: string): Observable<Agenda[]>;
  getAgendaDetalle(agendaId: number): Observable<AgendaDetalle>;
  getTagsPorAgenda(agendaId: number): Observable<TagResumen[]>;
  checkin(agendaId: number, lat?: number, lng?: number): Observable<void>;
  checkout(agendaId: number, lat?: number, lng?: number): Observable<void>;
}
