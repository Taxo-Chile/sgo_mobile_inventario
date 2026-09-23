import { Injectable, inject } from '@angular/core';
import { from, Observable, catchError, of } from 'rxjs';
import { HttpClient } from '../../../core/http/http-client';

@Injectable({ providedIn: 'root' })
export class CierresService {
  private http = inject(HttpClient);

  getDetalle(agendaId: number): Observable<any> {
    return from(
      this.http.get<any>(`tablet/cierres/detalle.php?agenda_id=${agendaId}`)
    ).pipe(
      catchError((err) => { throw err; })
    );
  }

  getEstado(agendaId: number): Observable<any> {
    return from(
      this.http.get<any>(`tablet/cierres/estado.php?agenda_id=${agendaId}`)
    ).pipe(
      catchError(() => of({
        pre_variance_cerrado: false,
        recuento_cerrado: false,
        puede_cerrar_final: false,
      }))
    );
  }
}
