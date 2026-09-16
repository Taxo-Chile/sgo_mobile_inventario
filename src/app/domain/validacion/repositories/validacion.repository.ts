import { Observable } from 'rxjs';
import { ValidacionTAG, ValidationResult, EtapaInfo, GatingResult, IncorporarSKU } from '../models/validacion.model';

export abstract class ValidacionRepository {
  abstract getTAGDetalle(agendaId: number, tagId: number): Observable<ValidacionTAG>;
  abstract guardarValidacion(resultado: ValidationResult): Observable<void>;
  abstract confirmarTAG(agendaId: number, tagId: number): Observable<{ completado: boolean; porcentaje: number }>;
  abstract getGating(agendaId: number): Observable<GatingResult>;
  abstract incorporarSKU(data: IncorporarSKU): Observable<void>;
  abstract getEtapa(agendaId: number): Observable<EtapaInfo>;
  abstract validarAcceso(agendaId: number, usuarioRut: string): Observable<boolean>;
}
