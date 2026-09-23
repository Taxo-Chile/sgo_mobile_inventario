import { Injectable, inject } from '@angular/core';
import { from, Observable, catchError, map, throwError } from 'rxjs';
import { HttpClient } from '../../../core/http/http-client';
import { PreVariance, PreVarianceProducto, PreVarianceDetalleResponse } from '../../../domain/pre-variance/models/pre-variance.model';

@Injectable({ providedIn: 'root' })
export class PreVarianceService {
  private http = inject(HttpClient);

  getDetalle(agendaId: number): Observable<PreVarianceDetalleResponse> {
    return from(
      this.http.get<any>(`tablet/pre-variance/detalle.php?agenda_id=${agendaId}`)
    ).pipe(
      map((response) => ({
        pre_variances: response.pre_variances ?? [],
        productos: response.productos ?? [],
        total_diferencias: response.total_diferencias ?? 0,
        estado_cierre: response.estado_cierre ?? 'SIN_REGISTRO',
        fecha_cierre: response.fecha_cierre ?? null,
      }))
    );
  }

  guardar(agendaId: number, productos: {
    id_producto: number;
    id_tag: number;
    decision: 'APROBADO' | 'RECHAZADO';
    cantidad: number;
    motivo?: string;
  }[]): Observable<any> {
    return from(
      this.http.post<any>('tablet/pre-variance/guardar.php', {
        agenda_id: agendaId,
        login: 'APP_TABLET',
        productos,
      })
    ).pipe(
      catchError((err) => {
        console.error('Error guardando Pre Variance:', err);
        return throwError(() => err);
      })
    );
  }
}
