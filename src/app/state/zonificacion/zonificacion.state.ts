import { Injectable, signal, computed } from '@angular/core';
import { ZonificacionResumen, ZonaDetalle, TagFueraZona } from '../../domain/zonificacion/models/zonificacion.model';

@Injectable({ providedIn: 'root' })
export class ZonificacionState {
  private readonly _data = signal<ZonificacionResumen | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly agenda = computed(() => this._data()?.agenda ?? null);
  readonly kpi = computed(() => this._data()?.kpi ?? null);
  readonly zonas = computed<ZonaDetalle[]>(() => this._data()?.zonas ?? []);
  readonly tagsFueraZona = computed<TagFueraZona[]>(() => this._data()?.tags_fuera_zona ?? []);
  readonly observaciones = computed<string[]>(() => this._data()?.observaciones ?? []);

  readonly tienePendientes = computed(() => (this.kpi()?.pendientes ?? 0) > 0);
  readonly tieneTagsFuera = computed(() => (this.kpi()?.fuera_zonificacion ?? 0) > 0);

  setData(data: ZonificacionResumen): void {
    this._data.set(data);
  }

  setLoading(v: boolean): void {
    this._loading.set(v);
  }

  setError(e: string | null): void {
    this._error.set(e);
  }

  clear(): void {
    this._data.set(null);
    this._loading.set(false);
    this._error.set(null);
  }
}
