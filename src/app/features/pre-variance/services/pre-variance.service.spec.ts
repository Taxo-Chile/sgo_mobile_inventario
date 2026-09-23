import { TestBed } from '@angular/core/testing';
import { PreVarianceService } from './pre-variance.service';
import { HttpClient } from '../../../core/http/http-client';

describe('PreVarianceService', () => {
  let service: PreVarianceService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpSpy }],
    });
    service = TestBed.inject(PreVarianceService);
  });

  describe('getDetalle', () => {
    it('mapea respuesta con defaults', (done) => {
      httpSpy.get.and.resolveTo({
        pre_variances: [{ id: 1 }],
        productos: [{ id_producto: 10 }],
        total_diferencias: 3,
        estado_cierre: 'PENDIENTE_ENVIO',
        fecha_cierre: '2026-09-23',
      });

      service.getDetalle(2376).subscribe((res) => {
        expect(res.pre_variances.length).toBe(1);
        expect(res.productos.length).toBe(1);
        expect(res.total_diferencias).toBe(3);
        expect(res.estado_cierre).toBe('PENDIENTE_ENVIO');
        expect(res.fecha_cierre).toBe('2026-09-23');
        expect(httpSpy.get).toHaveBeenCalledWith('tablet/pre-variance/detalle.php?agenda_id=2376');
        done();
      });
    });

    it('aplica defaults cuando faltan campos', (done) => {
      httpSpy.get.and.resolveTo({});

      service.getDetalle(1).subscribe((res) => {
        expect(res.pre_variances).toEqual([]);
        expect(res.productos).toEqual([]);
        expect(res.estado_cierre).toBe('SIN_REGISTRO');
        expect(res.fecha_cierre).toBeNull();
        done();
      });
    });

    it('propaga error del API', (done) => {
      httpSpy.get.and.rejectWith(new Error('No existe Kardex'));

      service.getDetalle(1).subscribe({
        next: () => fail('no debió emitir next'),
        error: (err) => {
          expect(err.message).toBe('No existe Kardex');
          done();
        },
      });
    });
  });

  describe('guardar', () => {
    it('POST con login APP_TABLET', (done) => {
      httpSpy.post.and.resolveTo({ id_conteo_c2: 5, productos_procesados: 2 });
      const productos = [
        { id_producto: 1, id_tag: 2, decision: 'APROBADO' as const, cantidad: 10 },
      ];

      service.guardar(2376, productos).subscribe((res) => {
        expect(httpSpy.post).toHaveBeenCalledWith('tablet/pre-variance/guardar.php', {
          agenda_id: 2376,
          login: 'APP_TABLET',
          productos,
        });
        expect(res.id_conteo_c2).toBe(5);
        done();
      });
    });

    it('propaga error real (no retorna null)', (done) => {
      httpSpy.post.and.rejectWith(new Error('Error al guardar Pre Variance: PK'));

      service.guardar(2376, []).subscribe({
        next: () => fail('no debió emitir next'),
        error: (err) => {
          expect(err.message).toContain('PK');
          done();
        },
      });
    });
  });
});
