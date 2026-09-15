import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { HttpClient } from '../../core/http/http-client';
import { ValidacionRepository } from '../../domain/validacion/repositories/validacion.repository';
import { TAG, ValidacionTAG, ValidacionCaptura, ValidationResult, EtapaInfo } from '../../domain/validacion/models/validacion.model';

@Injectable({ providedIn: 'root' })
export class ValidacionApiRepository implements ValidacionRepository {
  constructor(private http: HttpClient) {}

  getTAGDetalle(tagId: number): Observable<ValidacionTAG> {
    return from(this.http.get<ValidacionTAG>(`tablet/tag-detalle.php?id=${tagId}`));
  }

  getCapturasTAG(tagId: number): Observable<ValidacionCaptura[]> {
    return from(this.http.get<ValidacionCaptura[]>(`tablet/capturas.php?tag_id=${tagId}`));
  }

  guardarValidacion(resultado: ValidationResult): Observable<void> {
    return from(this.http.post<void>('tablet/validacion/guardar.php', resultado));
  }

  confirmarTAG(tagId: number): Observable<void> {
    return from(this.http.post<void>('tablet/validacion/confirmar.php', { tag_id: tagId }));
  }

  getEtapa(agendaId: number): Observable<EtapaInfo> {
    return from(this.http.get<EtapaInfo>(`tablet/etapa.php?agenda_id=${agendaId}`));
  }

  validarAcceso(agendaId: number, usuarioRut: string): Observable<boolean> {
    return from(this.http.get<boolean>(`tablet/validar-acceso.php?agenda_id=${agendaId}&rut=${usuarioRut}`));
  }
}
