import { TestBed } from '@angular/core/testing';
import { RecuentoState } from './recuento.state';
import { RecuentoProducto } from '../../domain/recuento/models/recuento.model';

function producto(partial: Partial<RecuentoProducto> & { id: number }): RecuentoProducto {
  return {
    recuento_id: 1,
    tag_id: 10,
    producto_id: partial.id,
    producto_nombre: 'Producto ' + partial.id,
    producto_sku: 'SKU' + partial.id,
    numero_tag: 1,
    cantidad_c1: 0,
    cantidad_c2: 0,
    cantidad_c3: null,
    cantidad_prevariance: 0,
    base_quantity: 0,
    base_origen: 'C2',
    diferencia_c2_c3: 0,
    precio_unitario: 0,
    diferencia_monto: 0,
    unidad_medida: 'UND',
    estado: 'PENDIENTE',
    tags_total: 1,
    tags_recontados: 0,
    capturista_rut: '0',
    fecha_captura: '',
    ...partial,
  };
}

describe('RecuentoState', () => {
  let state: RecuentoState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(RecuentoState);
    state.clear();
  });

  it('contadores por cobertura PENDIENTE/PARCIAL/RECONTADO', () => {
    state.setRecuento(null, [
      producto({ id: 1, estado: 'PENDIENTE' }),
      producto({ id: 2, estado: 'PARCIAL', tags_total: 3, tags_recontados: 1 }),
      producto({ id: 3, estado: 'RECONTADO', tags_total: 1, tags_recontados: 1 }),
      producto({ id: 4, estado: 'PENDIENTE' }),
    ]);

    expect(state.totalPendientes()).toBe(2);
    expect(state.totalParciales()).toBe(1);
    expect(state.totalRecontados()).toBe(1);
    expect(state.puedeFinalizar()).toBeFalse();
  });

  it('confirmarProducto marca CONFIRMADO, copia base a c3 y avanza cobertura', () => {
    state.setRecuento(null, [
      producto({ id: 1, base_quantity: 7, cantidad_c2: 6, tags_total: 1, tags_recontados: 0 }),
    ]);

    state.confirmarProducto(1);

    const p = state.productos()[0];
    expect(p.accion).toBe('CONFIRMADO');
    expect(p.cantidad_c3).toBe(7);
    expect(p.tags_recontados).toBe(1);
    expect(p.estado).toBe('RECONTADO');
    expect(state.totalConfirmados()).toBe(1);
    expect(state.puedeFinalizar()).toBeTrue();
  });

  it('modificarProducto marca MODIFICADO, guarda cantidad y motivo', () => {
    state.setRecuento(null, [
      producto({ id: 1, cantidad_c2: 5, tags_total: 1, tags_recontados: 0 }),
    ]);

    state.modificarProducto(1, 8, 'Diferencia contada');

    const p = state.productos()[0];
    expect(p.accion).toBe('MODIFICADO');
    expect(p.cantidad_c3).toBe(8);
    expect(p.diferencia_c2_c3).toBe(3);
    expect(p.motivo_modificacion).toBe('Diferencia contada');
    expect(p.estado).toBe('RECONTADO');
    expect(state.totalModificados()).toBe(1);
  });

  it('confirmar multiparcial pasa a PARCIAL hasta completar tags', () => {
    state.setRecuento(null, [
      producto({ id: 1, base_quantity: 4, tags_total: 2, tags_recontados: 0 }),
    ]);

    state.confirmarProducto(1);
    expect(state.productos()[0].estado).toBe('PARCIAL');

    state.confirmarProducto(1);
    expect(state.productos()[0].estado).toBe('RECONTADO');
    expect(state.productos()[0].tags_recontados).toBe(2);
  });

  it('puedeFinalizar=false sin productos', () => {
    state.setRecuento(null, []);
    expect(state.puedeFinalizar()).toBeFalse();
  });

  it('estaFinalizado cuando estado_cierre distinto de SIN_REGISTRO', () => {
    state.setRecuento(null, [producto({ id: 1 })], 'CERRADO');
    expect(state.estaFinalizado()).toBeTrue();
  });

  it('clear resetea estado', () => {
    state.setRecuento(null, [producto({ id: 1 })], 'CERRADO');
    state.clear();
    expect(state.productos()).toEqual([]);
    expect(state.estadoCierre()).toBe('SIN_REGISTRO');
    expect(state.estaFinalizado()).toBeFalse();
  });
});
