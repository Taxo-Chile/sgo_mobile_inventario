import { Injectable, signal, computed } from '@angular/core';
import { Recuento, RecuentoProducto, RecuentoResumen } from '../../domain/recuento/models/recuento.model';

@Injectable({ providedIn: 'root' })
export class RecuentoState {
  private readonly _recuento = signal<Recuento | null>(null);
  private readonly _productos = signal<RecuentoProducto[]>([]);
  private readonly _loading = signal(false);

  readonly recuento = this._recuento.asReadonly();
  readonly productos = this._productos.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly totalPendientes = computed(() =>
    this._productos().filter((p) => p.estado === 'PENDIENTE').length
  );

  readonly totalConfirmados = computed(() =>
    this._productos().filter((p) => p.estado === 'CONFIRMADO').length
  );

  readonly totalModificados = computed(() =>
    this._productos().filter((p) => p.estado === 'MODIFICADO').length
  );

  readonly montoTotalDiferencia = computed(() =>
    this._productos().reduce((sum, p) => sum + p.diferencia_monto, 0)
  );

  readonly puedeFinalizar = computed(() => {
    const pendientes = this.totalPendientes();
    return pendientes === 0 && this._productos().length > 0;
  });

  setRecuento(recuento: Recuento | null, productos: RecuentoProducto[]): void {
    this._recuento.set(recuento);
    this._productos.set(productos);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  confirmarProducto(productoId: number): void {
    this._productos.update((productos) =>
      productos.map((p) =>
        p.id === productoId ? { ...p, estado: 'CONFIRMADO', cantidad_c3: p.cantidad_c2 } : p
      )
    );
  }

  modificarProducto(productoId: number, nuevaCantidad: number, motivo: string): void {
    this._productos.update((productos) =>
      productos.map((p) =>
        p.id === productoId
          ? {
              ...p,
              estado: 'MODIFICADO',
              cantidad_c3: nuevaCantidad,
              diferencia_c2_c3: Math.abs(p.cantidad_c2 - nuevaCantidad),
              motivo_modificacion: motivo,
            }
          : p
      )
    );
  }

  clear(): void {
    this._recuento.set(null);
    this._productos.set([]);
    this._loading.set(false);
  }
}
