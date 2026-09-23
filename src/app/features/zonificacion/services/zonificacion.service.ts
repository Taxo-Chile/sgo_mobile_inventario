import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '../../../core/http/http-client';
import { ZonificacionResumen } from '../../../domain/zonificacion/models/zonificacion.model';
import { ZonificacionRepository } from '../../../domain/zonificacion/repositories/zonificacion.repository';

@Injectable({ providedIn: 'root' })
export class ZonificacionService extends ZonificacionRepository {
  private http = inject(HttpClient);

  getDetalle(agendaId: number): Observable<ZonificacionResumen> {
    return from(
      this.http.get<ZonificacionResumen>(`tablet/zonificacion/detalle.php?agenda_id=${agendaId}`)
    ).pipe(
      map(response => response),
      catchError(() => of(null as unknown as ZonificacionResumen))
    );
  }
}
