import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AgendaRepository } from '../../domain/agenda/repositories/agenda.repository';
import { AgendaState } from '../../state/agenda/agenda.state';
import { Agenda } from '../../domain/agenda/models/agenda.model';

@Injectable({ providedIn: 'root' })
export class GetAgendasUseCase {
  private agendaRepo = inject(AgendaRepository);
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
