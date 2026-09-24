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
      map((response) => {
        const productos = (response.productos ?? []).map(
          (p: any, i: number) => ({
            ...p,
            id: p.id ?? i + 1,
            id_tag: Number(p.id_tag ?? 0),
            numero_tag: Number(p.numero_tag ?? 0),
            id_producto: Number(p.id_producto ?? 0),
            cantidad_c1: Number(p.cantidad_c1 ?? 0),
            cantidad_c2: Number(p.cantidad_c2 ?? 0),
            diferencia: Number(p.diferencia ?? 0),
            diferencia_monto: Number(p.diferencia_monto ?? 0),
            stock_teorico: Number(p.stock_teorico ?? 0),
            precio_unitario: Number(p.precio_unitario ?? 0),
          })
        );
        return {
          pre_variances: response.pre_variances ?? [],
          productos,
          total_diferencias: response.total_diferencias ?? productos.length,
          estado_cierre: response.estado_cierre ?? 'SIN_REGISTRO',
          fecha_cierre: response.fecha_cierre ?? null,
        };
      })
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
