export interface Agenda {
  id: number;
  fecha: string;
  tienda_id: number;
  tienda_nombre: string;
  tienda_rut: string;
  auditor_rut: string;
  auditor_nombre: string;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'VALIDADA' | 'CERRADA';
  etapa: string;
  total_tags: number;
  tags_contados: number;
  porcentaje_avance: number;
  checkin_at?: string;
  checkout_at?: string;
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
