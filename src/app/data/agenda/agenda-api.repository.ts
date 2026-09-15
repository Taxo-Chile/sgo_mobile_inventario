import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { HttpClient } from '../../core/http/http-client';
import { AgendaRepository } from '../../domain/agenda/repositories/agenda.repository';
import { Agenda, AgendaDetalle, TagResumen } from '../../domain/agenda/models/agenda.model';

@Injectable({ providedIn: 'root' })
export class AgendaApiRepository implements AgendaRepository {
  constructor(private http: HttpClient) {}

  getAgendasPorAuditor(auditorRut: string): Observable<Agenda[]> {
    return from(this.http.get<Agenda[]>(`tablet/agendas.php?rut=${auditorRut}`));
  }

  getAgendaDetalle(agendaId: number): Observable<AgendaDetalle> {
    return from(this.http.get<AgendaDetalle>(`tablet/agenda-detalle.php?id=${agendaId}`));
  }

  getTagsPorAgenda(agendaId: number): Observable<TagResumen[]> {
    return from(this.http.get<TagResumen[]>(`tablet/tags.php?agenda_id=${agendaId}`));
  }

  checkin(agendaId: number, lat?: number, lng?: number): Observable<void> {
    return from(this.http.post<void>('tablet/checkin.php', { agenda_id: agendaId, lat, lng }));
  }

  checkout(agendaId: number, lat?: number, lng?: number): Observable<void> {
    return from(this.http.post<void>('tablet/checkout.php', { agenda_id: agendaId, lat, lng }));
  }
}
