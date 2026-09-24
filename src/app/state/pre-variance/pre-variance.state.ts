import { Injectable, signal, computed } from '@angular/core';
import { PreVariance, PreVarianceProducto, PreVarianceResumen } from '../../domain/pre-variance/models/pre-variance.model';

@Injectable({ providedIn: 'root' })
export class PreVarianceState {
  private readonly _preVariance = signal<PreVariance | null>(null);
  private readonly _productos = signal<PreVarianceProducto[]>([]);
  private readonly _loading = signal(false);
  private readonly _estadoCierre = signal<string>('SIN_REGISTRO');
  private readonly _fechaCierre = signal<string | null>(null);

  readonly preVariance = this._preVariance.asReadonly();
  readonly productos = this._productos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly estadoCierre = this._estadoCierre.asReadonly();
  readonly fechaCierre = this._fechaCierre.asReadonly();

  readonly productosConTag = computed(() =>
    this._productos().filter((p) => p.id_tag > 0)
  );

  readonly totalPendientes = computed(() =>
    this.productosConTag().filter((p) => p.estado === 'PENDIENTE').length
  );

  readonly totalAprobados = computed(() =>
    this.productosConTag().filter((p) => p.estado === 'APROBADO').length
  );

  readonly totalRechazados = computed(() =>
    this.productosConTag().filter((p) => p.estado === 'RECHAZADO').length
  );

  readonly montoTotalDiferencia = computed(() =>
    this._productos().reduce((sum, p) => sum + p.diferencia_monto, 0)
  );

  readonly montoTotalAprobado = computed(() =>
    this.productosConTag()
      .filter((p) => p.estado === 'APROBADO')
      .reduce((sum, p) => sum + p.diferencia_monto, 0)
  );

  readonly montoTotalRechazado = computed(() =>
    this.productosConTag()
      .filter((p) => p.estado === 'RECHAZADO')
      .reduce((sum, p) => sum + p.diferencia_monto, 0)
  );

  readonly puedeFinalizar = computed(() => {
    const conTag = this.productosConTag();
    return conTag.length > 0 && conTag.every((p) => p.estado !== 'PENDIENTE');
  });

  readonly estaFinalizado = computed(() => {
    return this._estadoCierre() !== 'SIN_REGISTRO' && this._estadoCierre() !== '';
  });

  setPreVariance(preVariance: PreVariance | null, productos: PreVarianceProducto[], estadoCierre?: string, fechaCierre?: string | null): void {
    this._preVariance.set(preVariance);
    this._productos.set(productos);
    if (estadoCierre) this._estadoCierre.set(estadoCierre);
    if (fechaCierre !== undefined) this._fechaCierre.set(fechaCierre);
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
    this._estadoCierre.set('SIN_REGISTRO');
    this._fechaCierre.set(null);
  }
}
