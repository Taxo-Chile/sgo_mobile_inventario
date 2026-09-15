export interface Cierre {
  id: number;
  agenda_id: number;
  tienda_id: number;
  tienda_nombre: string;
  tipo_cierre: 'PRE_VARIANCE' | 'RECUENTO' | 'FINAL';
  estado: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO' | 'BLOQUEADO';
  productos_total: number;
  productos_validados: number;
  monto_total: number;
  monto_diferencia: number;
  observaciones?: string;
  creado_por: string;
  creado_at: string;
  cerrado_por?: string;
  cerrado_at?: string;
  motivo_bloqueo?: string;
}

export interface CierreDetalle {
  cierre: Cierre;
  pre_variance?: {
    id: number;
    estado: string;
    monto_total: number;
    productos_pendientes: number;
  };
  recuento?: {
    id: number;
    estado: string;
    productos_pendientes: number;
  };
  validacion?: {
    total_capturas: number;
    capturas_pendientes: number;
    capturas_confirmadas: number;
    capturas_modificadas: number;
  };
  puede_cerrar: boolean;
  motivo_bloqueo?: string;
}

export interface CierreResult {
  exitoso: boolean;
  cierre_id: number;
  mensaje: string;
  errores?: string[];
}
