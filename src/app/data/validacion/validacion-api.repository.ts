import { Injectable } from '@angular/core';
import { from, Observable, catchError, of, map } from 'rxjs';
import { HttpClient } from '../../core/http/http-client';
import { ValidacionRepository, TagOperationResult, ProductoBuscado } from '../../domain/validacion/repositories/validacion.repository';
import { ValidacionTAG, ValidationResult, EtapaInfo, GatingResult, IncorporarSKU } from '../../domain/validacion/models/validacion.model';
import { MockDataService } from '../../shared/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class ValidacionApiRepository implements ValidacionRepository {
  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  getTAGDetalle(agendaId: number, tagId: number): Observable<ValidacionTAG> {
    return from(this.http.get<ValidacionTAG>(`tablet/tag-detalle.php?agenda_id=${agendaId}&tag_id=${tagId}`)).pipe(
      catchError(() => {
        console.log('API no disponible, usando datos mockup');
        return this.mockData.getTAGDetalle(agendaId, tagId);
      })
    );
  }

  guardarValidacion(resultado: ValidationResult): Observable<void> {
    return from(this.http.post<void>('tablet/validacion/guardar.php', resultado)).pipe(
      catchError((err) => {
        console.error('Error guardando validación:', err);
        throw err;
      })
    );
  }

  confirmarTAG(agendaId: number, tagId: number): Observable<{ completado: boolean; porcentaje: number }> {
    return from(this.http.get<{ completado: boolean; porcentaje: number }>(
      `tablet/validacion/confirmar.php?agenda_id=${agendaId}&tag_id=${tagId}`
    )).pipe(
      catchError(() => of({ completado: false, porcentaje: 0 }))
    );
  }

  getGating(agendaId: number): Observable<GatingResult> {
    return from(this.http.get<GatingResult>(`tablet/validacion/gating.php?agenda_id=${agendaId}`)).pipe(
      catchError(() => of({
        altillos: { total: 0, completos: 0, ok: true },
        pdv: { total: 0, completos: 0, objetivo: 0, ok: true },
        tags: { total: 0, cubiertos: 0 },
        cumple_prerequisitos: false,
      }))
    );
  }

  incorporarSKU(data: IncorporarSKU): Observable<void> {
    return from(this.http.post<void>('tablet/validacion/incorporar.php', data)).pipe(
      catchError((err) => {
        console.error('Error incorporando SKU:', err);
        throw err;
      })
    );
  }

  buscarProductos(agendaId: number, query: string): Observable<ProductoBuscado[]> {
    return from(this.http.get<{ productos: ProductoBuscado[] }>(
      `tablet/productos/buscar.php?agenda_id=${agendaId}&q=${encodeURIComponent(query)}`
    )).pipe(
      catchError(() => {
        console.log('API no disponible, búsqueda mockup');
        return of({ productos: [] });
      }),
      map((res) => res.productos || [])
    );
  }

  getEtapa(agendaId: number): Observable<EtapaInfo> {
    return from(this.http.get<EtapaInfo>(`tablet/etapa.php?agenda_id=${agendaId}`)).pipe(
      catchError(() => of({
        etapa_actual: 'VALIDACION',
        permite_validacion: true,
      }))
    );
  }

  validarAcceso(agendaId: number, usuarioRut: string): Observable<boolean> {
    return from(this.http.get<boolean>(`tablet/validar-acceso.php?agenda_id=${agendaId}&rut=${usuarioRut}`)).pipe(
      catchError(() => of(true))
    );
  }

  reactivarTAG(tagId: number): Observable<TagOperationResult> {
    return from(this.http.post<TagOperationResult>('tablet/tags/reactivar.php', { tag_id: tagId })).pipe(
      catchError((err) => { throw err; })
    );
  }

  anularTAG(tagId: number): Observable<TagOperationResult> {
    return from(this.http.post<TagOperationResult>('tablet/tags/anular.php', { tag_id: tagId })).pipe(
      catchError((err) => { throw err; })
    );
  }

  cerrarTAG(tagId: number): Observable<TagOperationResult> {
    return from(this.http.post<TagOperationResult>('tablet/tags/cerrar.php', { tag_id: tagId })).pipe(
      catchError((err) => { throw err; })
    );
  }

  crearTAG(agendaId: number, numeroTag: number, idTipoUbicacion: number): Observable<TagOperationResult & { descripcion_zona: string }> {
    return from(this.http.post<TagOperationResult & { descripcion_zona: string }>('tablet/tags/crear.php', {
      agenda_id: agendaId,
      numero_tag: numeroTag,
      id_tipo_ubicacion: idTipoUbicacion,
    })).pipe(
      catchError((err) => { throw err; })
    );
  }
}
