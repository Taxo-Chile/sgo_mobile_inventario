import { Observable } from 'rxjs';
import { TAG, ValidacionTAG, ValidacionCaptura, ValidationResult, EtapaInfo } from '../models/validacion.model';

export abstract class ValidacionRepository {
  abstract getTAGDetalle(tagId: number): Observable<ValidacionTAG>;
  abstract getCapturasTAG(tagId: number): Observable<ValidacionCaptura[]>;
  abstract guardarValidacion(resultado: ValidationResult): Observable<void>;
  abstract confirmarTAG(tagId: number): Observable<void>;
  abstract getEtapa(agendaId: number): Observable<EtapaInfo>;
  abstract validarAcceso(agendaId: number, usuarioRut: string): Observable<boolean>;
}
