import { TestBed } from '@angular/core/testing';
import { ValidacionApiRepository } from './validacion-api.repository';
import { HttpClient } from '../../core/http/http-client';
import { MockDataService } from '../../shared/services/mock-data.service';

describe('ValidacionApiRepository', () => {
  let repo: ValidacionApiRepository;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let mockSpy: jasmine.SpyObj<MockDataService>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    mockSpy = jasmine.createSpyObj('MockDataService', ['getTAGDetalle']);
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        { provide: MockDataService, useValue: mockSpy },
      ],
    });
    repo = TestBed.inject(ValidacionApiRepository);
  });

  describe('guardarValidacion', () => {
    it('hace POST a guardar.php', (done) => {
      httpSpy.post.and.resolveTo(undefined);
      const resultado = { agenda_id: 2376, tag_id: 1, capturas: [], login: 'x' } as any;

      repo.guardarValidacion(resultado).subscribe(() => {
        expect(httpSpy.post).toHaveBeenCalledWith('tablet/validacion/guardar.php', resultado);
        done();
      });
    });

    it('propaga error (no finge éxito mockup)', (done) => {
      httpSpy.post.and.rejectWith(new Error('Error al guardar validación'));

      repo.guardarValidacion({} as any).subscribe({
        next: () => fail('no debió emitir success'),
        error: (err) => {
          expect(err.message).toBe('Error al guardar validación');
          done();
        },
      });
    });
  });

  describe('incorporarSKU', () => {
    it('hace POST a incorporar.php', (done) => {
      httpSpy.post.and.resolveTo(undefined);
      const data = { agenda_id: 2376, tag_id: 1, id_producto: 9, cantidad: 2, motivo: 'm', login: 'x' } as any;

      repo.incorporarSKU(data).subscribe(() => {
        expect(httpSpy.post).toHaveBeenCalledWith('tablet/validacion/incorporar.php', data);
        done();
      });
    });

    it('propaga error (no finge éxito)', (done) => {
      httpSpy.post.and.rejectWith(new Error('SKU no pertenece a la muestra'));

      repo.incorporarSKU({} as any).subscribe({
        next: () => fail('no debió emitir success'),
        error: (err) => {
          expect(err.message).toBe('SKU no pertenece a la muestra');
          done();
        },
      });
    });
  });

  describe('operaciones TAG (deben re-lanzar errores)', () => {
    it('cerrarTAG propaga error', (done) => {
      httpSpy.post.and.rejectWith(new Error('tag ya FINALIZADO'));

      repo.cerrarTAG(1).subscribe({
        next: () => fail('no debió emitir success'),
        error: (err) => {
          expect(err.message).toContain('FINALIZADO');
          done();
        },
      });
    });

    it('crearTAG propaga error', (done) => {
      httpSpy.post.and.rejectWith(new Error('campos requeridos'));

      repo.crearTAG(2376, 99, 1).subscribe({
        next: () => fail('no debió emitir success'),
        error: (err) => {
          expect(err.message).toContain('requeridos');
          done();
        },
      });
    });
  });
});
