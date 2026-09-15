import { Observable } from 'rxjs';
import { TAG, ValidacionTAG, ValidacionCaptura, ValidationResult, EtapaInfo } from '../models/validacion.model';

export interface ValidacionRepository {
  getTAGDetalle(tagId: number): Observable<ValidacionTAG>;
  getCapturasTAG(tagId: number): Observable<ValidacionCaptura[]>;
  guardarValidacion(resultado: ValidationResult): Observable<void>;
  confirmarTAG(tagId: number): Observable<void>;
  getEtapa(agendaId: number): Observable<EtapaInfo>;
  validarAcceso(agendaId: number, usuarioRut: string): Observable<boolean>;
}
