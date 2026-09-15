import { Injectable, signal, computed } from '@angular/core';
import { Agenda, TagResumen } from '../../domain/agenda/models/agenda.model';

@Injectable({ providedIn: 'root' })
export class AgendaState {
  private readonly _agendas = signal<Agenda[]>([]);
  private readonly _selectedAgenda = signal<Agenda | null>(null);
  private readonly _tags = signal<TagResumen[]>([]);
  private readonly _loading = signal(false);

  readonly agendas = this._agendas.asReadonly();
  readonly selectedAgenda = this._selectedAgenda.asReadonly();
  readonly tags = this._tags.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly pendingCount = computed(() =>
    this._agendas().filter((a) => a.estado === 'PENDIENTE').length
  );

  setAgendas(agendas: Agenda[]): void {
    this._agendas.set(agendas);
  }

  selectAgenda(agenda: Agenda): void {
    this._selectedAgenda.set(agenda);
  }

  setTags(tags: TagResumen[]): void {
    this._tags.set(tags);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  updateAgendaStatus(agendaId: number, estado: Agenda['estado']): void {
    this._agendas.update((agendas) =>
      agendas.map((a) => (a.id === agendaId ? { ...a, estado } : a))
    );
  }
}
