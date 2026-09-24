import { TestBed } from '@angular/core/testing';
import { PreVarianceState } from './pre-variance.state';
import { PreVarianceProducto } from '../../domain/pre-variance/models/pre-variance.model';

function producto(partial: Partial<PreVarianceProducto> & { id: number }): PreVarianceProducto {
  return {
    id_producto: partial.id,
    id_tag: 10,
    producto_nombre: 'Producto ' + partial.id,
    producto_sku: 'SKU' + partial.id,
    cantidad_c1: 0,
    cantidad_c2: 0,
    diferencia_monto: 0,
    estado: 'PENDIENTE',
    ...partial,
  } as PreVarianceProducto;
}

describe('PreVarianceState', () => {
  let state: PreVarianceState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(PreVarianceState);
    state.clear();
  });

  it('puedeFinalizar ignora productos sin tag', () => {
    state.setPreVariance(null, [
      producto({ id: 1, id_tag: 0, estado: 'PENDIENTE' }),
      producto({ id: 2, id_tag: 50541, estado: 'APROBADO' }),
    ]);

    expect(state.totalPendientes()).toBe(0);
    expect(state.puedeFinalizar()).toBeTrue();
  });

  it('contadores pendientes/aprobados/rechazados', () => {
    state.setPreVariance(null, [
      producto({ id: 1, estado: 'PENDIENTE' }),
      producto({ id: 2, estado: 'APROBADO', diferencia_monto: 100 }),
      producto({ id: 3, estado: 'RECHAZADO', diferencia_monto: 50 }),
      producto({ id: 4, estado: 'PENDIENTE' }),
    ]);

    expect(state.totalPendientes()).toBe(2);
    expect(state.totalAprobados()).toBe(1);
    expect(state.totalRechazados()).toBe(1);
    expect(state.montoTotalAprobado()).toBe(100);
    expect(state.montoTotalRechazado()).toBe(50);
    expect(state.puedeFinalizar()).toBeFalse();
  });

  it('aprobarProducto cambia estado y habilita finalizar si no quedan pendientes', () => {
    state.setPreVariance(null, [producto({ id: 1, id_tag: 10 })]);
    expect(state.puedeFinalizar()).toBeFalse();

    state.aprobarProducto(1);
    expect(state.productos()[0].estado).toBe('APROBADO');
    expect(state.puedeFinalizar()).toBeTrue();
  });

  it('rechazarProducto guarda motivo', () => {
    state.setPreVariance(null, [producto({ id: 1 })]);
    state.rechazarProducto(1, 'Rechazado por auditor');

    expect(state.productos()[0].estado).toBe('RECHAZADO');
    expect((state.productos()[0] as any).motivo).toBe('Rechazado por auditor');
  });

  it('estaFinalizado con estado de cierre', () => {
    state.setPreVariance(null, [], 'CERRADO', '2026-09-23');
    expect(state.estaFinalizado()).toBeTrue();
    expect(state.fechaCierre()).toBe('2026-09-23');
  });

  it('clear resetea', () => {
    state.setPreVariance(null, [producto({ id: 1 })], 'CERRADO', '2026-09-23');
    state.clear();
    expect(state.productos()).toEqual([]);
    expect(state.estadoCierre()).toBe('SIN_REGISTRO');
    expect(state.fechaCierre()).toBeNull();
  });
});
