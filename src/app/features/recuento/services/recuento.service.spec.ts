import { TestBed } from '@angular/core/testing';
import { RecuentoService } from './recuento.service';
import { HttpClient } from '../../../core/http/http-client';

describe('RecuentoService', () => {
  let service: RecuentoService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const apiDetalle = {
    recuentos: [{ id: 10, estado: 'EN_CURSO' }],
    productos: [
      {
        id_producto: 101,
        cantidad_c1: 5,
        cantidad_c2: 6,
        cantidad_c3: null,
        cantidad_prevariance: 6,
        base_quantity: 6,
        tags_total: 2,
        tags_recontados: 0,
        stock_teorico: 6,
        valor_unitario: 1000,
        dif_inicial_valor: 0,
        estado: 'PENDIENTE',
      },
      {
        id_producto: 102,
        cantidad_c1: 3,
        cantidad_c2: 3,
        cantidad_c3: 4,
        cantidad_prevariance: 3,
        base_quantity: 3,
        tags_total: 1,
        tags_recontados: 1,
        stock_teorico: 3,
        valor_unitario: 500,
        dif_inicial_valor: 500,
        estado: 'RECONTADO',
      },
    ],
    umbral: 100000,
    total_pendientes: 1,
    total_parciales: 0,
    total_recontados: 1,
    estado_cierre: 'SIN_REGISTRO',
    snapshot_universo_completo: false,
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpSpy }],
    });
    service = TestBed.inject(RecuentoService);
  });

  describe('getDetalle', () => {
    it('mapea campos del API al dominio (id_producto→id, números, defaults)', (done) => {
      httpSpy.get.and.resolveTo(apiDetalle);

      service.getDetalle(2376).subscribe((res) => {
        expect(res.productos.length).toBe(2);
        expect(res.productos[0].id).toBe(101);
        expect(res.productos[0].cantidad_c3).toBeNull();
        expect(res.productos[1].cantidad_c3).toBe(4);
        expect(res.productos[0].tags_total).toBe(2);
        expect(res.productos[0].stock_teorico).toBe(6);
        expect(res.total_pendientes).toBe(1);
        expect(res.total_recontados).toBe(1);
        expect(res.umbral).toBe(100000);
        expect(res.estado_cierre).toBe('SIN_REGISTRO');
        expect(res.snapshot_universo_completo).toBeFalse();
        expect(httpSpy.get).toHaveBeenCalledWith('tablet/recuento/detalle.php?agenda_id=2376');
        done();
      });
    });

    it('propaga el error del API (no lo traga con empty payload)', (done) => {
      httpSpy.get.and.rejectWith(new Error('No existe Kardex para esta agenda'));

      service.getDetalle(999).subscribe({
        next: () => fail('no debió emitir next'),
        error: (err) => {
          expect(err.message).toBe('No existe Kardex para esta agenda');
          done();
        },
      });
    });

    it('normaliza nulls de totales y estado_cierre', (done) => {
      httpSpy.get.and.resolveTo({ recuentos: [], productos: [] });

      service.getDetalle(1).subscribe((res) => {
        expect(res.total_pendientes).toBe(0);
        expect(res.total_parciales).toBe(0);
        expect(res.total_recontados).toBe(0);
        expect(res.estado_cierre).toBe('SIN_REGISTRO');
        done();
      });
    });
  });

  describe('validar', () => {
    it('hace POST a validar.php con agenda y productos', (done) => {
      httpSpy.post.and.resolveTo(null);
      const productos = [{ producto_id: 101, cantidad_c3: 6, fl_corrige: 'N' as const }];

      service.validar(2376, productos).subscribe(() => {
        expect(httpSpy.post).toHaveBeenCalledWith('tablet/recuento/validar.php', {
          agenda_id: 2376,
          productos,
        });
        done();
      });
    });

    it('propaga error del API (no convierte en éxito)', (done) => {
      httpSpy.post.and.rejectWith(new Error('No es posible recalcular una agenda cerrada'));

      service.validar(2376, []).subscribe({
        next: () => fail('no debió emitir success'),
        error: (err) => {
          expect(err.message).toContain('agenda cerrada');
          done();
        },
      });
    });
  });

  describe('getPreview', () => {
    it('propaga error (no retorna null silencioso)', (done) => {
      httpSpy.get.and.rejectWith(new Error('No hay reapertura activa'));

      service.getPreview(2376).subscribe({
        next: () => fail('no debió emitir next'),
        error: (err) => {
          expect(err.message).toBe('No hay reapertura activa');
          done();
        },
      });
    });
  });
});
