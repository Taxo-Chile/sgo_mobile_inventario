import { Injectable } from '@angular/core';
import { from, Observable, catchError, of } from 'rxjs';
import { HttpClient } from '../../core/http/http-client';
import { ValidacionRepository } from '../../domain/validacion/repositories/validacion.repository';
import { TAG, ValidacionTAG, ValidacionCaptura, ValidationResult, EtapaInfo } from '../../domain/validacion/models/validacion.model';
import { MockDataService } from '../../shared/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class ValidacionApiRepository implements ValidacionRepository {
  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  getTAGDetalle(tagId: number): Observable<ValidacionTAG> {
    return from(this.http.get<ValidacionTAG>(`tablet/tag-detalle.php?id=${tagId}`)).pipe(
      catchError(() => {
        console.log('API no disponible, usando datos mockup');
        return this.mockData.getTAGDetalle(tagId);
      })
    );
  }

  getCapturasTAG(tagId: number): Observable<ValidacionCaptura[]> {
    return from(this.http.get<ValidacionCaptura[]>(`tablet/capturas.php?tag_id=${tagId}`)).pipe(
      catchError(() => {
        console.log('API no disponible, usando datos mockup');
        return of([]);
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

  confirmarTAG(tagId: number): Observable<void> {
    return from(this.http.post<void>('tablet/validacion/confirmar.php', { tag_id: tagId })).pipe(
      catchError(() => {
        console.log('API no disponible, TAG confirmado mockup');
        return new Observable<void>((subscriber) => {
          subscriber.next();
          subscriber.complete();
        });
      })
    );
  }

  getEtapa(agendaId: number): Observable<EtapaInfo> {
    return from(this.http.get<EtapaInfo>(`tablet/etapa.php?agenda_id=${agendaId}`)).pipe(
      catchError(() => {
        console.log('API no disponible, usando etapa mockup');
        return of({
          etapa_actual: 'VALIDACION',
          permite_validacion: true,
        });
      })
    );
  }

  validarAcceso(agendaId: number, usuarioRut: string): Observable<boolean> {
    return from(this.http.get<boolean>(`tablet/validar-acceso.php?agenda_id=${agendaId}&rut=${usuarioRut}`)).pipe(
      catchError(() => {
        console.log('API no disponible, acceso mockup permitido');
        return of(true);
      })
    );
  }
}
