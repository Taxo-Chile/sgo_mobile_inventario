export interface TAG {
  id: number;
  cod_sod: string;
  tienda_id: number;
  tienda_nombre: string;
  tipo: 'ALTILLO' | 'PDV';
  estado: 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADO' | 'ANULADO';
  productos_total: number;
  productos_contados: number;
  validacion_estado: 'PENDIENTE' | 'EN_CURSO' | 'VALIDADO';
  validacion_analista?: string;
  validacion_fecha?: string;
}

export interface Captura {
  id: number;
  tag_id: number;
  producto_id: number;
  producto_nombre: string;
  producto_sku: string;
  cantidad: number;
  unidad_medida: string;
  fecha_captura: string;
  capturista_rut: string;
  usuario?: string;
  es_reconteo?: boolean;
}

export interface ValidacionCaptura {
  captura_id: number;
  tag_id: number;
  producto_id: number;
  producto_nombre: string;
  producto_sku: string;
  c1_cantidad: number;
  c2_cantidad: number | null;
  unidad_medida: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'MODIFICADA';
  motivo_modificacion?: string;
}

export interface ValidacionTAG {
  tag: TAG;
  capturas: ValidacionCaptura[];
  total_pendientes: number;
  total_confirmadas: number;
  total_modificadas: number;
}

export interface ValidationResult {
  tag_id: number;
  accion: 'GUARDAR' | 'CONFIRMAR_TODO';
  capturas: ValidacionCaptura[];
}

export interface EtapaInfo {
  etapa_actual: string;
  permite_validacion: boolean;
  motivo_bloqueo?: string;
}
