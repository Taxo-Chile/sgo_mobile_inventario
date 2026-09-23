export interface Agenda {
  id: number;
  fecha: string;
  tienda_id: number;
  tienda_nombre: string;
  tienda_direccion?: string;
  auditor_rut: string;
  auditor_nombre: string;
  estado: string;
  etapa: string;
  total_tags: number;
  tags_contados: number;
  tags_validados: number;
  porcentaje_avance: number;
  checkin_at?: string;
  checkout_at?: string;
  pre_variance_estado?: {
    total_productos: number;
    aprobados: number;
    rechazados: number;
    completado: boolean;
  };
  recuento_estado?: {
    total_productos: number;
    corregidos: number;
    completado: boolean;
  };
  reglas_negocio?: {
    pre_variance_habilitada: boolean;
    pre_variance_cerrada: boolean;
    recuento_habilitado: boolean;
    altillos: {
      total: number;
      validados: number;
      cumple: boolean;
    };
    pdv: {
      total: number;
      validados: number;
      cumple: boolean;
    };
  };
}

export interface AgendaDetalle {
  agenda: Agenda;
  tags: TagResumen[];
}

export interface TagResumen {
  id: number;
  cod_sod: string;
  tienda_id: number;
  tienda_nombre: string;
  tipo: 'ALTILLO' | 'PDV';
  total_productos: number;
  total_contados: number;
  porcentaje_avance: number;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADO' | 'ANULADO';
  validacion_estado?: 'PENDIENTE' | 'EN_CURSO' | 'VALIDADO';
}
