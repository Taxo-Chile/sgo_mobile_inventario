import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { VALIDACION_REPOSITORY } from '../../core/tokens/repository.tokens';
import { ValidacionRepository } from '../../domain/validacion/repositories/validacion.repository';
import { ValidacionState } from '../../state/validacion/validacion.state';
import { ValidacionTAG } from '../../domain/validacion/models/validacion.model';

@Injectable({ providedIn: 'root' })
export class GetTAGDetalleUseCase {
  private validacionRepo = inject<ValidacionRepository>(VALIDACION_REPOSITORY);
  private validacionState = inject(ValidacionState);

  execute(tagId: number): Observable<ValidacionTAG> {
    this.validacionState.setLoading(true);
    return this.validacionRepo.getTAGDetalle(tagId).pipe(
      tap({
        next: (validacion) => {
          this.validacionState.setValidacionTAG(validacion);
          this.validacionState.setLoading(false);
        },
        error: () => this.validacionState.setLoading(false),
      })
    );
  }
}
