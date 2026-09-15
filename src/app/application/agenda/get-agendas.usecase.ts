import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AGENDA_REPOSITORY } from '../../core/tokens/repository.tokens';
import { AgendaRepository } from '../../domain/agenda/repositories/agenda.repository';
import { AgendaState } from '../../state/agenda/agenda.state';
import { Agenda } from '../../domain/agenda/models/agenda.model';

@Injectable({ providedIn: 'root' })
export class GetAgendasUseCase {
  private agendaRepo = inject<AgendaRepository>(AGENDA_REPOSITORY);
  private agendaState = inject(AgendaState);

  execute(auditorRut: string): Observable<Agenda[]> {
    this.agendaState.setLoading(true);
    return this.agendaRepo.getAgendasPorAuditor(auditorRut).pipe(
      tap({
        next: (agendas) => {
          this.agendaState.setAgendas(agendas);
          this.agendaState.setLoading(false);
        },
        error: () => this.agendaState.setLoading(false),
      })
    );
  }
}
