import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User } from '../../domain/auth/models/user.model';
import { Agenda, TagResumen } from '../../domain/agenda/models/agenda.model';
import { TAG, ValidacionTAG, ValidacionCaptura } from '../../domain/validacion/models/validacion.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly mockUser: User = {
    correo: 'admin@taxo.cl',
    rut: '12345678-5',
    rut_normalizado: '123456785',
    nombre: 'Juan Pérez',
    perfil: 'AUDITOR',
  };

  private readonly mockAgendas: Agenda[] = [
    {
      id: 1,
      fecha: '2026-09-15',
      tienda_id: 101,
      tienda_nombre: 'Sodimac Huechuraba',
      tienda_direccion: 'Av. La Estrella 123',
      auditor_rut: '123456785',
      auditor_nombre: 'Juan Pérez',
      estado: 'EN_CONTEO',
      etapa: 'VALIDACION',
      total_tags: 15,
      tags_contados: 8,
      tags_validados: 5,
      porcentaje_avance: 53,
      checkin_at: '2026-09-15 09:30:00',
    },
    {
      id: 2,
      fecha: '2026-09-15',
      tienda_id: 102,
      tienda_nombre: 'Sodimac Maipú',
      tienda_direccion: 'Av. Pajaritos 456',
      auditor_rut: '123456785',
      auditor_nombre: 'Juan Pérez',
      estado: 'PLANIFICADA',
      etapa: 'VALIDACION',
      total_tags: 12,
      tags_contados: 0,
      tags_validados: 0,
      porcentaje_avance: 0,
    },
    {
      id: 3,
      fecha: '2026-09-15',
      tienda_id: 103,
      tienda_nombre: 'Sodimac Las Condes',
      tienda_direccion: 'Av. Apoquindo 789',
      auditor_rut: '123456785',
      auditor_nombre: 'Juan Pérez',
      estado: 'CERRADA',
      etapa: 'VALIDACION',
      total_tags: 20,
      tags_contados: 20,
      tags_validados: 20,
      porcentaje_avance: 100,
      checkout_at: '2026-09-15 12:00:00',
    },
  ];

  private readonly mockTags: TagResumen[] = [
    {
      id: 1,
      cod_sod: 'ALT-001',
      tienda_id: 101,
      tienda_nombre: 'Sodimac Huechuraba',
      tipo: 'ALTILLO',
      total_productos: 45,
      total_contados: 45,
      porcentaje_avance: 100,
      estado: 'FINALIZADO',
      validacion_estado: 'VALIDADO',
    },
    {
      id: 2,
      cod_sod: 'ALT-002',
      tienda_id: 101,
      tienda_nombre: 'Sodimac Huechuraba',
      tipo: 'ALTILLO',
      total_productos: 38,
      total_contados: 30,
      porcentaje_avance: 79,
      estado: 'EN_CURSO',
      validacion_estado: 'EN_CURSO',
    },
    {
      id: 3,
      cod_sod: 'PDV-001',
      tienda_id: 101,
      tienda_nombre: 'Sodimac Huechuraba',
      tipo: 'PDV',
      total_productos: 25,
      total_contados: 20,
      porcentaje_avance: 80,
      estado: 'EN_CURSO',
      validacion_estado: 'PENDIENTE',
    },
    {
      id: 4,
      cod_sod: 'ALT-003',
      tienda_id: 101,
      tienda_nombre: 'Sodimac Huechuraba',
      tipo: 'ALTILLO',
      total_productos: 52,
      total_contados: 52,
      porcentaje_avance: 100,
      estado: 'FINALIZADO',
      validacion_estado: 'VALIDADO',
    },
    {
      id: 5,
      cod_sod: 'PDV-002',
      tienda_id: 101,
      tienda_nombre: 'Sodimac Huechuraba',
      tipo: 'PDV',
      total_productos: 30,
      total_contados: 10,
      porcentaje_avance: 33,
      estado: 'PENDIENTE',
      validacion_estado: 'PENDIENTE',
    },
    {
      id: 6,
      cod_sod: 'PDV-003',
      tienda_id: 101,
      tienda_nombre: 'Sodimac Huechuraba',
      tipo: 'PDV',
      total_productos: 20,
      total_contados: 20,
      porcentaje_avance: 100,
      estado: 'FINALIZADO',
      validacion_estado: 'VALIDADO',
    },
    {
      id: 7,
      cod_sod: 'ALT-004',
      tienda_id: 101,
      tienda_nombre: 'Sodimac Huechuraba',
      tipo: 'ALTILLO',
      total_productos: 0,
      total_contados: 0,
      porcentaje_avance: 0,
      estado: 'ANULADO',
      validacion_estado: 'PENDIENTE',
    },
  ];

  private readonly mockCapturas: ValidacionCaptura[] = [
    {
      id_conteo_det_c1: 1,
      id_producto: 101,
      producto_nombre: 'Pintura Vinícola Blanca 20L',
      producto_sku: 'PINT-20L-BLA',
      c1_cantidad: 15,
      c2_cantidad: 15,
      unidad_medida: 'UN',
      estado: 'CONFIRMADA',
      motivo: null,
      login_operador: 'auditor01',
      fecha_captura: '2026-09-15 10:00:00',
    },
    {
      id_conteo_det_c1: 2,
      id_producto: 102,
      producto_nombre: 'Cemento gris 25kg',
      producto_sku: 'CEM-25K-GRIS',
      c1_cantidad: 48,
      c2_cantidad: 48,
      unidad_medida: 'BLS',
      estado: 'CONFIRMADA',
      motivo: null,
      login_operador: 'auditor01',
      fecha_captura: '2026-09-15 10:05:00',
    },
    {
      id_conteo_det_c1: 3,
      id_producto: 103,
      producto_nombre: 'Tubo PVC 4" x 6m',
      producto_sku: 'TUB-4P-6M',
      c1_cantidad: 32,
      c2_cantidad: 32,
      unidad_medida: 'UN',
      estado: 'CONFIRMADA',
      motivo: null,
      login_operador: 'auditor01',
      fecha_captura: '2026-09-15 10:10:00',
    },
    {
      id_conteo_det_c1: 4,
      id_producto: 104,
      producto_nombre: 'Lámina至于 1.20m x 2.40m',
      producto_sku: 'LAM-120-240',
      c1_cantidad: 25,
      c2_cantidad: 27,
      unidad_medida: 'UN',
      estado: 'MODIFICADA',
      motivo: 'Diferencia de stock',
      login_operador: 'auditor01',
      fecha_captura: '2026-09-15 10:15:00',
    },
    {
      id_conteo_det_c1: 5,
      id_producto: 105,
      producto_nombre: 'Malla electrosoldada 1.80m',
      producto_sku: 'MAL-180-ES',
      c1_cantidad: 18,
      c2_cantidad: 18,
      unidad_medida: 'UN',
      estado: 'CONFIRMADA',
      motivo: null,
      login_operador: 'auditor01',
      fecha_captura: '2026-09-15 10:20:00',
    },
  ];

  login(): Observable<User> {
    return of(this.mockUser).pipe(delay(800));
  }

  getAgendas(): Observable<Agenda[]> {
    return of(this.mockAgendas).pipe(delay(500));
  }

  getTags(agendaId: number): Observable<TagResumen[]> {
    return of(this.mockTags).pipe(delay(500));
  }

  getAgendaDetalle(agendaId: number): Observable<{ agenda: Agenda; tags: TagResumen[] }> {
    const agenda = this.mockAgendas.find((a) => a.id === agendaId) || this.mockAgendas[0];
    const tags = this.mockTags.filter((t) => t.tienda_id === agenda.tienda_id);
    return of({ agenda, tags }).pipe(delay(500));
  }

  getTAGDetalle(agendaId: number, tagId: number): Observable<ValidacionTAG> {
    const capturas = this.mockCapturas;

    return of({
      tag: {
        id_tag: tagId,
        numero_tag: 2,
        id_tipo_ubicacion: 1,
        estado_tag: 'EN_CURSO',
        codigo_tipo: 'ALT',
        nombre_tipo: 'Altillo',
        tipo_validacion: 'ALTILLO' as const,
      } as TAG,
      capturas: capturas,
      total_pendientes: capturas.filter((c) => c.estado === 'PENDIENTE').length,
      total_confirmadas: capturas.filter((c) => c.estado === 'CONFIRMADA').length,
      total_modificadas: capturas.filter((c) => c.estado === 'MODIFICADA').length,
      id_conteo_c1: 1,
      id_conteo_c2: null,
    }).pipe(delay(600));
  }
}
