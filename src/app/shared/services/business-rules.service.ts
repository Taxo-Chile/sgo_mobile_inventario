import { Injectable } from '@angular/core';
import { TagResumen } from '../../domain/agenda/models/agenda.model';

export interface BusinessRuleResult {
  altillos: {
    total: number;
    validados: number;
    objetivo: number;
    porcentaje: number;
    cumple: boolean;
  };
  pdv: {
    total: number;
    validados: number;
    objetivo: number;
    porcentaje: number;
    cumple: boolean;
  };
  puedeCerrar: boolean;
  motivoBloqueo?: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessRulesService {
  /**
   * Altillos: 100% of TAGs must be validated
   * PDV: 30% of TAGs must be validated (minimum)
   * TAGs ANULADO are excluded from counts
   * Partial TAGs (not FINALIZADO) don't count as validated
   */
  evaluar(tags: TagResumen[]): BusinessRuleResult {
    const activos = tags.filter((t) => t.estado !== 'ANULADO');

    const altillosActivos = activos.filter((t) => t.tipo === 'ALTILLO');
    const altillosValidados = altillosActivos.filter(
      (t) => t.estado === 'FINALIZADO'
    );

    const pdvActivos = activos.filter((t) => t.tipo === 'PDV');
    const pdvValidados = pdvActivos.filter(
      (t) => t.estado === 'FINALIZADO'
    );

    const altillosObjetivo = altillosActivos.length;
    const pdvObjetivo = Math.ceil(pdvActivos.length * 0.3);

    const altillosPct = altillosActivos.length > 0
      ? Math.round((altillosValidados.length / altillosActivos.length) * 100)
      : 100;

    const pdvPct = pdvActivos.length > 0
      ? Math.round((pdvValidados.length / pdvObjetivo) * 100)
      : 100;

    const altillosCumple = altillosValidados.length >= altillosObjetivo;
    const pdvCumple = pdvValidados.length >= pdvObjetivo;

    const puedeCerrar = altillosCumple && pdvCumple;

    let motivoBloqueo: string | undefined;
    if (!altillosCumple) {
      motivoBloqueo = `Faltan ${altillosObjetivo - altillosValidados.length} TAGs Altillos por validar (requiere 100%)`;
    } else if (!pdvCumple) {
      motivoBloqueo = `Faltan ${pdvObjetivo - pdvValidados.length} TAGs PDV por validar (requiere ${pdvObjetivo} = 30% de ${pdvActivos.length})`;
    }

    return {
      altillos: {
        total: altillosActivos.length,
        validados: altillosValidados.length,
        objetivo: altillosObjetivo,
        porcentaje: altillosPct,
        cumple: altillosCumple,
      },
      pdv: {
        total: pdvActivos.length,
        validados: pdvValidados.length,
        objetivo: pdvObjetivo,
        porcentaje: pdvPct,
        cumple: pdvCumple,
      },
      puedeCerrar,
      motivoBloqueo,
    };
  }
}
