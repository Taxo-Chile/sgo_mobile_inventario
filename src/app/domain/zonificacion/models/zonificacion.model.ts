export interface ZonificacionAgenda {
  id_agenda: number;
  numero_agenda: string;
  codigo_tienda: string;
  nombre_tienda: string;
  fecha: string;
  estado: string;
}

export interface ZonificacionKPI {
  tag_planificados: number;
  tag_validados: number;
  pendientes: number;
  fuera_zonificacion: number;
  porcentaje_cobertura: number;
}

export interface ZonaDetalle {
  id_zonificacion_det: number;
  orden: number;
  tag_desde: number;
  tag_hasta: number;
  descripcion: string;
  qty_zonificado: number;
  tag_validados: number;
  pendientes: number;
  porcentaje_cobertura: number;
  productos_distintos: number;
  total_capturas: number;
  total_unidades: number;
}

export interface TagFueraZona {
  numero_tag: number;
  zona: string;
  sku_distintos: number;
  capturas: number;
  productos: string[];
  productos_total: number;
}

export interface ZonificacionResumen {
  agenda: ZonificacionAgenda;
  kpi: ZonificacionKPI;
  zonas: ZonaDetalle[];
  tags_fuera_zona: TagFueraZona[];
  observaciones: string[];
}
