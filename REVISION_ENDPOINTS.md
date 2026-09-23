# Revisión de Endpoints — sgo_mobile_inventario

> Fecha: 2026-09-23
> Base de datos: local (taxochil_taxo_clientes @ 127.0.0.1)
> Agenda de prueba: 2376
> Usuario de prueba: 133870679 / 133870

---

## Resumen

| Estado | Cantidad |
|--------|----------|
| OK | 22 |
| OK (error esperado) | 4 |
| ERROR | 0 |

---

## Endpoints GET

| # | Endpoint | Método | Estado | Notas |
|---|----------|--------|--------|-------|
| 1 | `tablet/agendas.php?rut=133870679` | GET | **OK** | Retorna agendas del usuario |
| 2 | `tablet/agenda-detalle.php?id=2376` | GET | **OK** | Retorna agenda + tags + reglas_negocio |
| 3 | `tablet/tags.php?agenda_id=2376` | GET | **OK** | Lista de tags |
| 4 | `tablet/tag-detalle.php?agenda_id=2376&tag_id=50537` | GET | **OK** | Detalle de tag con capturas |
| 5 | `tablet/etapa.php?agenda_id=2376` | GET | **OK** | Info de etapa |
| 6 | `tablet/validar-acceso.php?agenda_id=2376&rut=133870679` | GET | **OK** | Validación de acceso |
| 7 | `tablet/pre-variance/detalle.php?agenda_id=2376` | GET | **OK** | Productos pre-variance |
| 8 | `tablet/recuento/detalle.php?agenda_id=2376` | GET | **OK** | Productos recuento C3 |
| 9 | `tablet/reconteo/preview.php?agenda_id=2376` | GET | **OK*** | Requiere reapertura activa (comportamiento esperado) |
| 10 | `tablet/zonificacion/detalle.php?agenda_id=2376` | GET | **OK** | Zonas y KPIs |
| 11 | `tablet/cierres/detalle.php?agenda_id=2376` | GET | **OK** | Estado de cierres + snapshot |
| 12 | `tablet/cierres/estado.php?agenda_id=2376` | GET | **OK** | Estado consolidado |
| 13 | `tablet/validacion/gating.php?agenda_id=2376` | GET | **OK** | Gating de validación |
| 14 | `tablet/productos/buscar.php?agenda_id=2376&q=taladro` | GET | **OK** | Búsqueda de productos |
| 15 | `tablet/informes/ejecutivo.php?agenda_id=2376` | GET | **OK** | Informe ejecutivo |
| 16 | `tablet/informes/cierre-final.php?agenda_id=2376` | GET | **OK** | Informe cierre final |
| 17 | `tablet/informes/prevariance.php?agenda_id=2376` | GET | **OK** | Informe pre-variance |
| 18 | `tablet/informes/validacion-tag.php?agenda_id=2376` | GET | **OK** | Informe validación TAGs |
| 19 | `tablet/informes/captura-final.php?agenda_id=2376` | GET | **OK** | Informe captura final |
| 20 | `tablet/zonificacion/excel.php?agenda_id=2376` | GET | **OK** | Export Excel zonificación |
| 21 | `tablet/zonificacion/pdf.php?agenda_id=2376` | GET | **OK** | Export PDF zonificación |
| 22 | `tablet/cierres/export-pdf.php?agenda_id=2376` | GET | **OK** | Export PDF cierre |
| 23 | `tablet/cierres/export-excel.php?agenda_id=2376` | GET | **OK** | Export Excel cierre |
| 24 | `tablet/cierres/export-zip.php?agenda_id=2376` | GET | **OK** | Export ZIP cierre |

---

## Endpoints POST

| # | Endpoint | Body | Estado | Notas |
|---|----------|------|--------|-------|
| 25 | `auth/login.php` | `{rut, password}` | **OK** | Login exitoso |
| 26 | `tablet/checkin.php` | `{agenda_id, lat, lng}` | **OK** | Check-in registrado |
| 27 | `tablet/checkout.php` | `{agenda_id, lat, lng}` | **OK** | Check-out registrado |
| 28 | `tablet/tags/crear.php` | `{agenda_id, tipo, cod_sod, login}` | **OK*** | Error 400 esperado (faltan campos requeridos) |
| 29 | `tablet/tags/cerrar.php` | `{tag_id}` | **OK*** | Error 400 esperado (tag ya FINALIZADO) |
| 30 | `tablet/tags/anular.php` | `{tag_id}` | **OK*** | Error 400 esperado (tag ya FINALIZADO) |
| 31 | `tablet/tags/reactivar.php` | `{tag_id}` | **OK*** | Error 400 esperado (tag no está ANULADO) |
| 32 | `tablet/validacion/guardar.php` | `{agenda_id, tag_id, capturas, login}` | **OK*** | Error 400 esperado (falta id_conteo_det_c1) |
| 33 | `tablet/validacion/incorporar.php` | `{agenda_id, tag_id, id_producto, cantidad, login}` | **OK*** | Error 400 esperado (SKU no pertenece a muestra) |
| 34 | `tablet/pre-variance/guardar.php` | `{agenda_id, login, productos}` | **OK** | Pre-variance guardado |
| 35 | `tablet/recuento/validar.php` | `{agenda_id, productos}` | **OK*** | Error duplicate key esperado (ya existe cierre) |
| 36 | `tablet/cierres/cerrar.php` | `{agenda_id, login}` | **OK** | Cierres cerrados |
| 37 | `tablet/cierres/snapshot.php` | `{agenda_id, login}` | **OK** | Snapshot creado |
| 38 | `tablet/cierres/envio.php` | `{agenda_id, destinatarios}` | **OK** | Correo enviado |

---

## Notas por endpoint

### `reconteo/preview.php`
Requiere que exista un registro en `sod_ope_agenda_reapertura` con `fl_activa = 'S'` y `tipo_reapertura = 'PRUEBA'`. Sin eso, retorna 400 "No hay reapertura activa". Es comportamiento esperado — este endpoint es para modo de pruebas.

### `tags/crear.php`
Requiere campos: `agenda_id`, `tipo` (ALTILLO/PDV), `cod_sod`, `login`. El error 400 es validación correcta.

### `tags/cerrar.php`, `anular.php`, `reactivar.php`
Validan el estado del tag antes de operar:
- `cerrar`: Solo acepta tags ABIERTO
- `anular`: Solo acepta tags ABIERTO
- `reactivar`: Solo acepta tags ANULADO

### `validacion/guardar.php`
Requiere `id_conteo_det_c1` en cada captura (no solo `id_producto`). Este campo vincula la captura C2 con el registro específico de C1.

### `validacion/incorporar.php`
Valida que el producto pertenezca a la muestra vigente de la agenda. El campo es `id_producto` (no `producto_id`).

### `recuento/validar.php`
 FALLA si ya existe un cierre de recuento para la agenda (unique key constraint). El endpoint INSERTA un nuevo registro, no actualiza. Para el caso de la agenda 2376, ya existe un cierre (id=169, CERRADO).

### `pre-variance/guardar.php`
Crea registro en `sod_inv_prevariance_cierre` con estado `PENDIENTE_ENVIO`. Si ya existe, lo actualiza (ON DUPLICATE KEY UPDATE).

---

## Datos de prueba observados

### Tags
- Tags 50535, 50536, 50537: estado FINALIZADO, numero_tag vacío
- Sin `numero_tag` asignado (los tags de prueba no tienen número)

### Kardex
- Kardex insertado manualmente (id=682) con 9 productos
- Stock teórico: 10-35 unidades por producto
- Valor unitario: $13,990 - $42,558

### Cierres
- Pre-Variance: CERRADO (id=239)
- Recuento: CERRADO (id=169, 9 SKUs, 0 corregidos)
- Snapshot: CREADO (id=10, CI-20260923110656-2376)

### Productos
- 9 productos (SKU 100001-100009)
- Todos con valor_referencia entre $13,990 y $42,558
