import { Injectable } from '@angular/core';
import { from, Observable, catchError, of } from 'rxjs';
import { HttpClient } from '../../core/http/http-client';
import { ValidacionRepository } from '../../domain/validacion/repositories/validacion.repository';
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
      catchError(() => {
        console.log('API no disponible, validación mockup guardada');
        return new Observable<void>((subscriber) => {
          subscriber.next();
          subscriber.complete();
        });
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
      catchError(() => {
        console.log('API no disponible, incorporación mockup');
        return new Observable<void>((subscriber) => {
          subscriber.next();
          subscriber.complete();
        });
      })
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
}
