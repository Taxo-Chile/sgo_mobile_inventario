import { Injectable, inject } from '@angular/core';
import { from, Observable, catchError } from 'rxjs';
import { HttpClient } from '../../core/http/http-client';
import { AgendaRepository } from '../../domain/agenda/repositories/agenda.repository';
import { Agenda, AgendaDetalle, TagResumen } from '../../domain/agenda/models/agenda.model';
import { MockDataService } from '../../shared/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class AgendaApiRepository implements AgendaRepository {
  private readonly http = inject(HttpClient);
  private readonly mockData = inject(MockDataService);

  getAgendasPorAuditor(auditorRut: string): Observable<Agenda[]> {
    return from(this.http.get<Agenda[]>(`tablet/agendas.php?rut=${auditorRut}`)).pipe(
      catchError(() => {
        console.log('API no disponible, usando datos mockup');
        return this.mockData.getAgendas();
      })
    );
  }

  getAgendaDetalle(agendaId: number): Observable<AgendaDetalle> {
    return from(this.http.get<AgendaDetalle>(`tablet/agenda-detalle.php?id=${agendaId}`)).pipe(
      catchError(() => {
        console.log('API no disponible, usando datos mockup');
        return this.mockData.getAgendaDetalle(agendaId);
      })
    );
  }

  getTagsPorAgenda(agendaId: number): Observable<TagResumen[]> {
    return from(this.http.get<TagResumen[]>(`tablet/tags.php?agenda_id=${agendaId}`)).pipe(
      catchError(() => {
        console.log('API no disponible, usando datos mockup');
        return this.mockData.getTags(agendaId);
      })
    );
  }

  checkin(agendaId: number, lat?: number, lng?: number): Observable<void> {
    return from(this.http.post<void>('tablet/checkin.php', { agenda_id: agendaId, lat, lng })).pipe(
      catchError(() => {
        console.log('API no disponible, checkin mockup');
        return new Observable<void>((subscriber) => {
          subscriber.next();
          subscriber.complete();
        });
      })
    );
  }

  checkout(agendaId: number, lat?: number, lng?: number): Observable<void> {
    return from(this.http.post<void>('tablet/checkout.php', { agenda_id: agendaId, lat, lng })).pipe(
      catchError(() => {
        console.log('API no disponible, checkout mockup');
        return new Observable<void>((subscriber) => {
          subscriber.next();
          subscriber.complete();
        });
      })
    );
  }
}
