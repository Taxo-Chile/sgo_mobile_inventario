import { Injectable, signal, computed } from '@angular/core';
import { Cierre, CierreDetalle } from '../../domain/cierre/models/cierre.model';

@Injectable({ providedIn: 'root' })
export class CierreState {
  private readonly _cierres = signal<Cierre[]>([]);
  private readonly _cierreActual = signal<CierreDetalle | null>(null);
  private readonly _loading = signal(false);

  readonly cierres = this._cierres.asReadonly();
  readonly cierreActual = this._cierreActual.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly cierresPendientes = computed(() =>
    this._cierres().filter((c) => c.estado === 'PENDIENTE').length
  );

  readonly cierresCompletados = computed(() =>
    this._cierres().filter((c) => c.estado === 'COMPLETADO').length
  );

  readonly tienePreVariancePendiente = computed(() => {
    const detalle = this._cierreActual();
    return detalle?.pre_variance?.productos_pendientes ?? 0 > 0;
  });

  readonly tieneRecuentoPendiente = computed(() => {
    const detalle = this._cierreActual();
    return detalle?.recuento?.productos_pendientes ?? 0 > 0;
  });

  readonly tieneValidacionPendiente = computed(() => {
    const detalle = this._cierreActual();
    return detalle?.validacion?.capturas_pendientes ?? 0 > 0;
  });

  readonly puedeCerrarFinal = computed(() => {
    const detalle = this._cierreActual();
    return detalle?.puede_cerrar ?? false;
  });

  setCierres(cierres: Cierre[]): void {
    this._cierres.set(cierres);
  }

  setCierreActual(detalle: CierreDetalle): void {
    this._cierreActual.set(detalle);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  actualizarCierre(cierre: Cierre): void {
    this._cierres.update((cierres) =>
      cierres.map((c) => (c.id === cierre.id ? cierre : c))
    );
  }

  clear(): void {
    this._cierres.set([]);
    this._cierreActual.set(null);
    this._loading.set(false);
  }
}
