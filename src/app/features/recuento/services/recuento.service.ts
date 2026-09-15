import { Injectable, inject } from '@angular/core';
import { from, Observable, catchError, of } from 'rxjs';
import { HttpClient } from '../../../core/http/http-client';
import { Recuento, RecuentoProducto } from '../../../domain/recuento/models/recuento.model';

@Injectable({ providedIn: 'root' })
export class RecuentoService {
  private http = inject(HttpClient);

  getDetalle(agendaId: number): Observable<{
    recuentos: Recuento[];
    productos: RecuentoProducto[];
    total_pendientes: number;
    total_confirmados: number;
    total_modificados: number;
    monto_total_diferencia: number;
  }> {
    return from(
      this.http.get<any>(`tablet/recuento/detalle.php?agenda_id=${agendaId}`)
    ).pipe(
      catchError(() => of({
        recuentos: [],
        productos: [],
        total_pendientes: 0,
        total_confirmados: 0,
        total_modificados: 0,
        monto_total_diferencia: 0,
      }))
    );
  }

  validar(recuentoId: number, productos: { producto_id: number; estado: string; cantidad_c3?: number; motivo?: string }[]): Observable<void> {
    return from(
      this.http.post<void>(`tablet/recuento/validar.php`, {
        recuento_id: recuentoId,
        productos,
      })
    ).pipe(
      catchError(() => of(undefined))
    );
  }
}
