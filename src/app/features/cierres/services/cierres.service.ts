import { Injectable, inject } from '@angular/core';
import { from, Observable, catchError, of } from 'rxjs';
import { HttpClient } from '../../../core/http/http-client';
import { Cierre, CierreDetalle } from '../../../domain/cierre/models/cierre.model';

@Injectable({ providedIn: 'root' })
export class CierresService {
  private http = inject(HttpClient);

  getCierres(agendaId: number): Observable<{ cierres: Cierre[] }> {
    return from(
      this.http.get<{ cierres: Cierre[] }>(`tablet/cierres/detalle.php?agenda_id=${agendaId}`)
    ).pipe(
      catchError(() => of({ cierres: [] }))
    );
  }

  getEstado(agendaId: number): Observable<{
    cierres: Cierre[];
    pre_variance_cerrado: boolean;
    recuento_cerrado: boolean;
    puede_cerrar_final: boolean;
  }> {
    return from(
      this.http.get<any>(`tablet/cierres/estado.php?agenda_id=${agendaId}`)
    ).pipe(
      catchError(() => of({
        cierres: [],
        pre_variance_cerrado: false,
        recuento_cerrado: false,
        puede_cerrar_final: false,
      }))
    );
  }

  cerrar(cierreId: number, observaciones?: string): Observable<void> {
    return from(
      this.http.post<void>(`tablet/cierres/cerrar.php`, {
        cierre_id: cierreId,
        observaciones,
      })
    ).pipe(
      catchError(() => of(undefined))
    );
  }
}
