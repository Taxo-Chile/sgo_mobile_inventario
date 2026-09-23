import { Injectable, inject } from '@angular/core';
import { from, Observable, catchError, of } from 'rxjs';
import { HttpClient } from '../../../core/http/http-client';

export interface InformeItem {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class InformesService {
  private http = inject(HttpClient);

  readonly INFORMES: InformeItem[] = [
    {
      id: 'ejecutivo',
      nombre: 'Informe Ejecutivo',
      icono: 'document-text-outline',
      color: 'primary',
      descripcion: 'Resumen general del proceso de inventario',
    },
    {
      id: 'cierre-final',
      nombre: 'Cierre Final',
      icono: 'lock-closed-outline',
      color: 'success',
      descripcion: 'Snapshot inmutable del cierre congelado',
    },
    {
      id: 'prevariance',
      nombre: 'Pre-Variance',
      icono: 'analytics-outline',
      color: 'warning',
      descripcion: 'Diferencias entre stock teorico y fisico',
    },
    {
      id: 'validacion-tag',
      nombre: 'Validacion de TAGs',
      icono: 'pricetag-outline',
      color: 'tertiary',
      descripcion: 'Estado de TAGs y productos asignados',
    },
    {
      id: 'captura-final',
      nombre: 'Captura Final',
      icono: 'calculator-outline',
      color: 'secondary',
      descripcion: 'Resumen de capturas C1, C2 y C3',
    },
  ];

  getInforme(informeId: string, agendaId: number): Observable<any> {
    return from(
      this.http.get<any>(`tablet/informes/${informeId}.php?agenda_id=${agendaId}`)
    ).pipe(
      catchError((err) => { throw err; })
    );
  }
}
