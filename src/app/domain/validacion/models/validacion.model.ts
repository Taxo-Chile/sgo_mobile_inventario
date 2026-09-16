export interface TAG {
  id_tag: number;
  numero_tag: number;
  id_tipo_ubicacion: number;
  estado_tag: string;
  codigo_tipo: string;
  nombre_tipo: string;
  tipo_validacion: 'ALTILLO' | 'PDV' | 'OTRO';
}

export interface Captura {
  id_conteo_det_c1: number;
  id_producto: number;
  producto_sku: string;
  producto_nombre: string;
  c1_cantidad: number;
  fecha_captura: string;
  login_operador: string;
  estado_registro: string;
}

export interface ValidacionCaptura {
  id_conteo_det_c1: number;
  id_producto: number;
  producto_sku: string;
  producto_nombre: string;
  c1_cantidad: number;
  c2_cantidad: number | null;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'MODIFICADA';
  motivo: string | null;
  login_operador: string;
  fecha_captura: string;
  unidad_medida: string;
}

export interface ValidacionTAG {
  tag: TAG;
  capturas: ValidacionCaptura[];
  total_pendientes: number;
  total_confirmadas: number;
  total_modificadas: number;
  id_conteo_c1: number;
  id_conteo_c2: number | null;
}

export interface ValidationResult {
  agenda_id: number;
  tag_id: number;
  login: string;
  capturas: {
    id_conteo_det_c1: number;
    id_producto: number;
    decision: 'CONFIRMAR' | 'MODIFICAR';
    c2_cantidad?: number;
    motivo?: string;
    id_motivo_correccion?: number;
  }[];
}

export interface EtapaInfo {
  etapa_actual: string;
  permite_validacion: boolean;
  motivo_bloqueo?: string;
}

export interface GatingResult {
  altillos: { total: number; completos: number; ok: boolean };
  pdv: { total: number; completos: number; objetivo: number; ok: boolean };
  tags: { total: number; cubiertos: number };
  cumple_prerequisitos: boolean;
}

export interface IncorporarSKU {
  agenda_id: number;
  tag_id: number;
  id_producto: number;
  cantidad: number;
  motivo: string;
  login: string;
}
