import { Injectable, inject } from '@angular/core';
import { from, Observable, catchError, of } from 'rxjs';
import { HttpClient } from '../../../core/http/http-client';
import { PreVariance, PreVarianceProducto } from '../../../domain/pre-variance/models/pre-variance.model';

@Injectable({ providedIn: 'root' })
export class PreVarianceService {
  private http = inject(HttpClient);

  getDetalle(agendaId: number): Observable<{
    pre_variances: PreVariance[];
    productos: PreVarianceProducto[];
    total_pendientes: number;
    total_aprobados: number;
    total_rechazados: number;
    monto_total_diferencia: number;
  }> {
    return from(
      this.http.get<any>(`tablet/pre-variance/detalle.php?agenda_id=${agendaId}`)
    ).pipe(
      catchError(() => of({
        pre_variances: [],
        productos: [],
        total_pendientes: 0,
        total_aprobados: 0,
        total_rechazados: 0,
        monto_total_diferencia: 0,
      }))
    );
  }

  validar(preVarianceId: number, productos: { producto_id: number; estado: string; motivo?: string }[]): Observable<void> {
    return from(
      this.http.post<void>(`tablet/pre-variance/validar.php`, {
        pre_variance_id: preVarianceId,
        productos,
      })
    ).pipe(
      catchError(() => of(undefined))
    );
  }
}
