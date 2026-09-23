import { Injectable, signal, computed } from '@angular/core';
import { Recuento, RecuentoProducto, RecuentoResumen } from '../../domain/recuento/models/recuento.model';

@Injectable({ providedIn: 'root' })
export class RecuentoState {
  private readonly _recuento = signal<Recuento | null>(null);
  private readonly _productos = signal<RecuentoProducto[]>([]);
  private readonly _loading = signal(false);
  private readonly _estadoCierre = signal<string>('SIN_REGISTRO');

  readonly recuento = this._recuento.asReadonly();
  readonly productos = this._productos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly estadoCierre = this._estadoCierre.asReadonly();

  readonly totalPendientes = computed(() =>
    this._productos().filter((p) => p.estado === 'PENDIENTE').length
  );

  readonly totalParciales = computed(() =>
    this._productos().filter((p) => p.estado === 'PARCIAL').length
  );

  readonly totalRecontados = computed(() =>
    this._productos().filter((p) => p.estado === 'RECONTADO').length
  );

  readonly totalConfirmados = computed(() =>
    this._productos().filter((p) => p.accion === 'CONFIRMADO').length
  );

  readonly totalModificados = computed(() =>
    this._productos().filter((p) => p.accion === 'MODIFICADO').length
  );

  readonly montoTotalDiferencia = computed(() =>
    this._productos().reduce((sum, p) => sum + p.diferencia_monto, 0)
  );

  readonly puedeFinalizar = computed(() => {
    const pendientes = this.totalPendientes();
    return pendientes === 0 && this._productos().length > 0;
  });

  readonly estaFinalizado = computed(() => {
    return this._estadoCierre() !== 'SIN_REGISTRO' && this._estadoCierre() !== '';
  });

  setRecuento(recuento: Recuento | null, productos: RecuentoProducto[], estadoCierre?: string): void {
    this._recuento.set(recuento);
    this._productos.set(productos);
    if (estadoCierre) this._estadoCierre.set(estadoCierre);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  confirmarProducto(productoId: number): void {
    this._productos.update((productos) =>
      productos.map((p) => {
        if (p.id !== productoId) return p;
        const tagsTotal = p.tags_total || 1;
        const tagsRec = Math.min((p.tags_recontados || 0) + 1, tagsTotal);
        return {
          ...p,
          accion: 'CONFIRMADO' as const,
          cantidad_c3: p.base_quantity ?? p.cantidad_c2,
          tags_recontados: tagsRec,
          estado: (tagsRec <= 0
            ? 'PENDIENTE'
            : tagsRec < tagsTotal
              ? 'PARCIAL'
              : 'RECONTADO') as RecuentoProducto['estado'],
        };
      })
    );
  }

  modificarProducto(productoId: number, nuevaCantidad: number, motivo: string): void {
    this._productos.update((productos) =>
      productos.map((p) => {
        if (p.id !== productoId) return p;
        const tagsTotal = p.tags_total || 1;
        const tagsRec = Math.min((p.tags_recontados || 0) + 1, tagsTotal);
        return {
          ...p,
          accion: 'MODIFICADO' as const,
          cantidad_c3: nuevaCantidad,
          diferencia_c2_c3: Math.abs(p.cantidad_c2 - nuevaCantidad),
          motivo_modificacion: motivo,
          tags_recontados: tagsRec,
          estado: (tagsRec <= 0
            ? 'PENDIENTE'
            : tagsRec < tagsTotal
              ? 'PARCIAL'
              : 'RECONTADO') as RecuentoProducto['estado'],
        };
      })
    );
  }

  clear(): void {
    this._recuento.set(null);
    this._productos.set([]);
    this._loading.set(false);
    this._estadoCierre.set('SIN_REGISTRO');
  }
}
