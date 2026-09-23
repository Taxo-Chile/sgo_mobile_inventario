import { TestBed } from '@angular/core/testing';
import { HttpClient } from './http-client';

describe('HttpClient', () => {
  let service: HttpClient;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpClient);
    fetchSpy = spyOn(window, 'fetch');
    localStorage.removeItem('sgo_token');
  });

  afterEach(() => {
    localStorage.removeItem('sgo_token');
  });

  it('debe desenpaquetar data del envelope OK', async () => {
    fetchSpy.and.resolveTo(
      new Response(JSON.stringify({ status: 'OK', msg: 'ok', data: { id: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await service.get<{ id: number }>('tablet/agendas.php');

    expect(result).toEqual({ id: 1 });
    expect(fetchSpy).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/tablet\/agendas\.php$/),
      jasmine.objectContaining({ method: 'GET' })
    );
  });

  it('debe lanzar Error con msg cuando status es ERROR', async () => {
    fetchSpy.and.resolveTo(
      new Response(JSON.stringify({ status: 'ERROR', msg: 'No existe Kardex' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expectAsync(service.get('tablet/recuento/detalle.php')).toBeRejectedWithError(
      'No existe Kardex'
    );
  });

  it('debe lanzar Error con msg cuando HTTP no es ok', async () => {
    fetchSpy.and.resolveTo(
      new Response(JSON.stringify({ status: 'ERROR', msg: 'Agenda cerrada' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expectAsync(service.post('tablet/recuento/validar.php', {})).toBeRejectedWithError(
      'Agenda cerrada'
    );
  });

  it('debe enviar Authorization Bearer cuando hay token', async () => {
    localStorage.setItem('sgo_token', 'tok-123');
    fetchSpy.and.resolveTo(
      new Response(JSON.stringify({ status: 'OK', data: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await service.get('tablet/etapa.php');

    const headers = (fetchSpy.calls.mostRecent().args[1] as RequestInit).headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer tok-123');
  });

  it('POST debe enviar body JSON', async () => {
    fetchSpy.and.resolveTo(
      new Response(JSON.stringify({ status: 'OK', data: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await service.post('tablet/pre-variance/guardar.php', { agenda_id: 1 });

    const init = fetchSpy.calls.mostRecent().args[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ agenda_id: 1 }));
  });
});
