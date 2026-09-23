export interface RecuentoProducto {
  id: number;
  recuento_id: number;
  tag_id: number;
  producto_id: number;
  producto_nombre: string;
  producto_sku: string;
  numero_tag: number;
  cantidad_c1: number;
  cantidad_c2: number;
  cantidad_c3: number | null;
  cantidad_prevariance: number;
  base_quantity: number;
  base_origen: string;
  diferencia_c2_c3: number;
  precio_unitario: number;
  diferencia_monto: number;
  unidad_medida: string;
  /** Cobertura de tags (servidor): PENDIENTE / PARCIAL / RECONTADO */
  estado: 'PENDIENTE' | 'PARCIAL' | 'RECONTADO';
  /** Acción local de captura hasta que se recarga del servidor */
  accion?: 'CONFIRMADO' | 'MODIFICADO';
  tags_total: number;
  tags_recontados: number;
  stock_teorico?: number;
  valor_unitario?: number;
  dif_inicial_valor?: number;
  motivo_modificacion?: string;
  capturista_rut: string;
  capturista_nombre?: string;
  fecha_captura: string;
}

export interface Recuento {
  id: number;
  agenda_id: number;
  tag_id: number;
  tienda_id: number;
  tienda_nombre: string;
  tipo_recuento: 'CRITICO' | 'PRE_VARIANCE' | 'SOLICITADO';
  cantidad_productos: number;
  monto_total_diferencia: number;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADO' | 'ANULADO';
  creado_por: string;
  creado_at: string;
  finalizado_por?: string;
  finalizado_at?: string;
}

export interface RecuentoResumen {
  recuento: Recuento;
  productos: RecuentoProducto[];
  total_pendientes: number;
  total_parciales: number;
  total_recontados: number;
  monto_total_diferencia: number;
}

export interface RecuentoDetalleResponse {
  recuentos: Recuento[];
  productos: RecuentoProducto[];
  total_pendientes: number;
  total_parciales: number;
  total_recontados: number;
  estado_cierre: string;
  umbral?: number;
  snapshot_universo_completo?: boolean;
}
