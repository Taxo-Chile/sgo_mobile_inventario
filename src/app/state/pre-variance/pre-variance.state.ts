import { Injectable, signal, computed } from '@angular/core';
import { PreVariance, PreVarianceProducto, PreVarianceResumen } from '../../domain/pre-variance/models/pre-variance.model';

@Injectable({ providedIn: 'root' })
export class PreVarianceState {
  private readonly _preVariance = signal<PreVariance | null>(null);
  private readonly _productos = signal<PreVarianceProducto[]>([]);
  private readonly _loading = signal(false);

  readonly preVariance = this._preVariance.asReadonly();
  readonly productos = this._productos.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly totalPendientes = computed(() =>
    this._productos().filter((p) => p.estado === 'PENDIENTE').length
  );

  readonly totalAprobados = computed(() =>
    this._productos().filter((p) => p.estado === 'APROBADO').length
  );

  readonly totalRechazados = computed(() =>
    this._productos().filter((p) => p.estado === 'RECHAZADO').length
  );

  readonly montoTotalDiferencia = computed(() =>
    this._productos().reduce((sum, p) => sum + p.diferencia_monto, 0)
  );

  readonly montoTotalAprobado = computed(() =>
    this._productos()
      .filter((p) => p.estado === 'APROBADO')
      .reduce((sum, p) => sum + p.diferencia_monto, 0)
  );

  readonly montoTotalRechazado = computed(() =>
    this._productos()
      .filter((p) => p.estado === 'RECHAZADO')
      .reduce((sum, p) => sum + p.diferencia_monto, 0)
  );

  readonly puedeFinalizar = computed(() => {
    const pendientes = this.totalPendientes();
    return pendientes === 0 && this._productos().length > 0;
  });

  setPreVariance(preVariance: PreVariance | null, productos: PreVarianceProducto[]): void {
    this._preVariance.set(preVariance);
    this._productos.set(productos);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  aprobarProducto(productoId: number): void {
    this._productos.update((productos) =>
      productos.map((p) =>
        p.id === productoId ? { ...p, estado: 'APROBADO' } : p
      )
    );
  }

  rechazarProducto(productoId: number, motivo: string): void {
    this._productos.update((productos) =>
      productos.map((p) =>
        p.id === productoId ? { ...p, estado: 'RECHAZADO', motivo } : p
      )
    );
  }

  clear(): void {
    this._preVariance.set(null);
    this._productos.set([]);
    this._loading.set(false);
  }
}
