import { Injectable, signal, computed } from '@angular/core';
import { ValidacionTAG, ValidacionCaptura, EtapaInfo } from '../../domain/validacion/models/validacion.model';

@Injectable({ providedIn: 'root' })
export class ValidacionState {
  private readonly _validacionTAG = signal<ValidacionTAG | null>(null);
  private readonly _capturas = signal<ValidacionCaptura[]>([]);
  private readonly _etapa = signal<EtapaInfo | null>(null);
  private readonly _loading = signal(false);

  readonly validacionTAG = this._validacionTAG.asReadonly();
  readonly capturas = this._capturas.asReadonly();
  readonly etapa = this._etapa.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly totalPendientes = computed(() =>
    this._capturas().filter((c) => c.estado === 'PENDIENTE').length
  );

  readonly totalConfirmadas = computed(() =>
    this._capturas().filter((c) => c.estado === 'CONFIRMADA').length
  );

  readonly totalModificadas = computed(() =>
    this._capturas().filter((c) => c.estado === 'MODIFICADA').length
  );

  readonly puedeConfirmar = computed(() => {
    const etapa = this._etapa();
    return etapa?.permite_validacion && this.totalPendientes() === 0;
  });

  setValidacionTAG(validacion: ValidacionTAG): void {
    this._validacionTAG.set(validacion);
    this._capturas.set(validacion.capturas);
  }

  setEtapa(etapa: EtapaInfo): void {
    this._etapa.set(etapa);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  confirmarCaptura(capturaId: number): void {
    this._capturas.update((capturas) =>
      capturas.map((c) =>
        c.captura_id === capturaId ? { ...c, estado: 'CONFIRMADA', c2_cantidad: c.c1_cantidad } : c
      )
    );
  }

  modificarCaptura(capturaId: number, nuevaCantidad: number, motivo: string): void {
    this._capturas.update((capturas) =>
      capturas.map((c) =>
        c.captura_id === capturaId
          ? { ...c, estado: 'MODIFICADA', c2_cantidad: nuevaCantidad, motivo_modificacion: motivo }
          : c
      )
    );
  }

  agregarCaptura(captura: ValidacionCaptura): void {
    this._capturas.update((capturas) => [...capturas, captura]);
  }

  clear(): void {
    this._validacionTAG.set(null);
    this._capturas.set([]);
    this._etapa.set(null);
  }
}
