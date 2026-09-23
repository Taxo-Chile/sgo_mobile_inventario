import { Injectable, inject } from '@angular/core';
import { from, Observable, map } from 'rxjs';
import { HttpClient } from '../../../core/http/http-client';
import { Recuento, RecuentoProducto, RecuentoDetalleResponse } from '../../../domain/recuento/models/recuento.model';

export interface PreviewReapertura {
  id: number;
  motivo: string;
  fecha_apertura: string;
  login_apertura: string;
}

export interface PreviewProducto {
  id_producto: number;
  producto_sku: string;
  producto_nombre: string;
  numero_tag: number;
  id_tag: number;
  cantidad_c1: number;
  cantidad_c2: number;
  cantidad_prevariance: number;
  base_quantity: number;
  estado: 'PENDIENTE' | 'RECONTADO' | 'CON_DIFERENCIA';
  diferencia?: number;
}

export interface PreviewResult {
  modo_pruebas: boolean;
  reapertura: PreviewReapertura;
  productos: PreviewProducto[];
  total_recontados: number;
  total_pendientes: number;
  total_con_diferencia: number;
  fecha_corte: string;
}

@Injectable({ providedIn: 'root' })
export class RecuentoService {
  private http = inject(HttpClient);

  getDetalle(agendaId: number): Observable<RecuentoDetalleResponse> {
    return from(
      this.http.get<any>(`tablet/recuento/detalle.php?agenda_id=${agendaId}`)
    ).pipe(
      map((response) => ({
        recuentos: response.recuentos ?? [],
        productos: (response.productos ?? []).map((p: any) => ({
          ...p,
          id: p.id_producto,
          cantidad_c1: Number(p.cantidad_c1),
          cantidad_c2: Number(p.cantidad_c2),
          cantidad_c3: p.cantidad_c3 !== null && p.cantidad_c3 !== undefined
            ? Number(p.cantidad_c3)
            : null,
          cantidad_prevariance: Number(p.cantidad_prevariance),
          base_quantity: Number(p.base_quantity),
          tags_total: Number(p.tags_total ?? 0),
          tags_recontados: Number(p.tags_recontados ?? 0),
          stock_teorico: Number(p.stock_teorico ?? 0),
          valor_unitario: Number(p.valor_unitario ?? 0),
          dif_inicial_valor: Number(p.dif_inicial_valor ?? 0),
          estado: p.estado ?? 'PENDIENTE',
        })),
        total_pendientes: response.total_pendientes ?? 0,
        total_parciales: response.total_parciales ?? 0,
        total_recontados: response.total_recontados ?? 0,
        estado_cierre: response.estado_cierre ?? 'SIN_REGISTRO',
        umbral: response.umbral,
        snapshot_universo_completo: response.snapshot_universo_completo,
      }))
    );
  }

  getPreview(agendaId: number): Observable<PreviewResult | null> {
    return from(
      this.http.get<any>(`tablet/reconteo/preview.php?agenda_id=${agendaId}`)
    );
  }

  validar(agendaId: number, productos: { producto_id: number; cantidad_c3: number; fl_corrige: 'S' | 'N' }[]): Observable<void> {
    return from(
      this.http.post<void>(`tablet/recuento/validar.php`, {
        agenda_id: agendaId,
        productos,
      })
    );
  }
}
