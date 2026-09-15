export interface PreVarianceProducto {
  id: number;
  pre_variance_id: number;
  tag_id: number;
  producto_id: number;
  producto_nombre: string;
  producto_sku: string;
  cantidad_c1: number;
  cantidad_c2: number;
  diferencia: number;
  precio_unitario: number;
  diferencia_monto: number;
  unidad_medida: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  motivo?: string;
  validado_por?: string;
  validado_at?: string;
}

export interface PreVariance {
  id: number;
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
