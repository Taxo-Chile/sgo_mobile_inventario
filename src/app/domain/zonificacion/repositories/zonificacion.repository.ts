import { Observable } from 'rxjs';
import { ZonificacionResumen } from '../models/zonificacion.model';

export abstract class ZonificacionRepository {
  abstract getDetalle(agendaId: number): Observable<ZonificacionResumen>;
}
