export interface PreVarianceProducto {
  id: number;
  id_tag: number;
  numero_tag: number;
  id_producto: number;
  producto_nombre: string;
  producto_sku: string;
  precio_unitario: number;
  stock_teorico: number;
  cantidad_c1: number;
  cantidad_c2: number;
  diferencia: number;
  diferencia_monto: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  motivo?: string;
}

export interface PreVariance {
  id_conteo: number;
  agenda_id: number;
  tag_id: number;
  tienda_id: number;
  tienda_nombre: string;
  monto_total_diferencia: number;
  cantidad_productos: number;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'APROBADO' | 'RECHAZADO' | 'CERRADO';
  creado_por: string;
  creado_at: string;
  validado_por?: string;
  validado_at?: string;
  cerrado_por?: string;
  cerrado_at?: string;
}

export interface PreVarianceResumen {
  pre_variance: PreVariance;
  productos: PreVarianceProducto[];
  total_pendientes: number;
  total_aprobados: number;
  total_rechazados: number;
  monto_total_aprobado: number;
  monto_total_rechazado: number;
}

export interface PreVarianceDetalleResponse {
  pre_variances: PreVariance[];
  productos: PreVarianceProducto[];
  total_diferencias: number;
  estado_cierre: string;
  fecha_cierre: string | null;
}
