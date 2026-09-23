import { Observable } from 'rxjs';
import { ValidacionTAG, ValidationResult, EtapaInfo, GatingResult, IncorporarSKU } from '../models/validacion.model';

export interface TagOperationResult {
  id_tag: number;
  numero_tag: number;
  estado_tag: string;
}

export interface ProductoBuscado {
  id_producto: number;
  sku: string;
  descripcion_producto: string;
  codigo_barras: string;
}

export abstract class ValidacionRepository {
  abstract getTAGDetalle(agendaId: number, tagId: number): Observable<ValidacionTAG>;
  abstract guardarValidacion(resultado: ValidationResult): Observable<void>;
  abstract confirmarTAG(agendaId: number, tagId: number): Observable<{ completado: boolean; porcentaje: number }>;
  abstract getGating(agendaId: number): Observable<GatingResult>;
  abstract incorporarSKU(data: IncorporarSKU): Observable<void>;
  abstract buscarProductos(agendaId: number, query: string): Observable<ProductoBuscado[]>;
  abstract getEtapa(agendaId: number): Observable<EtapaInfo>;
  abstract validarAcceso(agendaId: number, usuarioRut: string): Observable<boolean>;
  abstract reactivarTAG(tagId: number): Observable<TagOperationResult>;
  abstract anularTAG(tagId: number): Observable<TagOperationResult>;
  abstract cerrarTAG(tagId: number): Observable<TagOperationResult>;
  abstract crearTAG(agendaId: number, numeroTag: number, idTipoUbicacion: number): Observable<TagOperationResult & { descripcion_zona: string }>;
}
