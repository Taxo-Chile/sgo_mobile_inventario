# Discrepancias ScriptCase vs API — Validación de Inventario

> Fecha: 2026-09-23
> Fuente de verdad: `sgo.app/` (ScriptCase)
> API: `sodimac-ws/api/tablet/`
> App: `sgo_mobile_inventario`

---

## Estado

| # | Severidad | Descripción | Estado |
|---|-----------|-------------|--------|
| 1 | CRÍTICA | Modelo C3: Pre-Variance vs Recuento | Pendiente |
| 2 | CRÍTICA | Precio para umbral Pre-Variance | Pendiente |
| 3 | CRÍTICA | Fuente de productos para Pre-Variance | Pendiente |
| 4 | ALTA | Filtro origen C2 en vista de detalle | Pendiente |
| 5 | ALTA | Validación zonificación en Pre-Variance | Pendiente |
| 6 | ALTA | Stored procedures post-guardado | Pendiente |
| 7 | MEDIA | Granularidad: agrupado vs línea por línea | Pendiente |
| 8 | MEDIA | Dispositivo: SGO_ANALISTA vs APP_TABLET | Pendiente |
| 9 | MEDIA | Umbral configurable vs hardcodeado | Pendiente |
| 10 | MEDIA | Creación de tags durante Pre-Variance | Pendiente |
| 11 | MEDIA | Cierre Pre-Variance (solo API) | Pendiente |
| 12 | MEDIA | Origen pattern diferente | Pendiente |
| 13 | BAJA | Audit: nivel de detalle | Pendiente |
| 14 | BAJA | id_motivo_correccion (solo API) | Pendiente |
| 15 | BAJA | User data: sec_users join (solo ScriptCase) | Pendiente |
| 16 | BAJA | Report structure: flat vs pivoted | Pendiente |

---

## Detalle de cada discrepancia

### #1 — CRÍTICA: Modelo C3

**ScriptCase:** La iteración 3 es Pre-Variance
- `sod_inv_conteo.numero_iteracion = 3`
- `sod_inv_conteo.tipo_conteo = 'VALIDACION'`
- `sod_inv_conteo_det.origen = 'SGO_PREVARIANCE'`
- `sod_inv_conteo_det.dispositivo = 'SGO_ANALISTA'`

**API:** La iteración 3 es Recuento
- `sod_inv_conteo.numero_iteracion = 3`
- `sod_inv_conteo.tipo_conteo = 'RECONTEO'`
- `sod_inv_conteo_det.origen = 'SGO_RECUENTO'`
- Pre-Variance se almacena en C2 con `origen = 'SGO_PREVARIANCE'`

**Impacto:** ScriptCase no puede ver datos de recuento. La API no puede ver C3 de ScriptCase.

---

### #2 — CRÍTICA: Precio para umbral Pre-Variance

**ScriptCase:** Usa `sod_inv_kardex_det.valor_unitario`
```sql
ABS((fisico - kd.stock_teorico) * kd.valor_unitario) > $umbral
```

**API:** Usa `sod_cfg_producto.valor_referencia`
```sql
ROUND(ABS(diferencia * p.valor_referencia), 0) >= 500000
```

**Impacto:** Para el mismo producto, el umbral puede dar resultados diferentes si `valor_unitario` (kardex) ≠ `valor_referencia` (producto).

---

### #3 — CRÍTICA: Fuente de productos para Pre-Variance

**ScriptCase:** Itera sobre `sod_inv_muestra_det` (productos asignados a la muestra)

**API:** Itera sobre `sod_inv_conteo_det` donde `id_conteo = C1` (productos efectivamente capturados)

**Impacto:** La API solo ve productos que fueron contados. ScriptCase ve todos los de la muestra, incluyendo los no contados.

---

### #4 — ALTA: Filtro origen C2 en vista de detalle

**ScriptCase:** No filtra C2 por `origen` en la vista principal de validación

**API:** `tag-detalle.php` filtra C2 por `origen = 'SGO_ANALISTA'`

**Impacto:** ScriptCase muestra todos los registros C2 (incluyendo pre-variance). La API solo muestra los del analista.

---

### #5 — ALTA: Validación zonificación en Pre-Variance

**ScriptCase:** Al guardar pre-variance, valida que el TAG esté dentro del rango de zonificación
```sql
WHERE numero_tag BETWEEN tag_desde AND tag_hasta
```

**API:** No realiza validación de zonificación

**Impacto:** La API permite guardar pre-variance para tags fuera de zona.

---

### #6 — ALTA: Stored procedures post-guardado

**ScriptCase:** No llama stored procedures después de guardar C2 o pre-variance

**API:** Llama:
- `PRC_SOD_INV_C3_INVALIDAR_POSTERIOR_V1` (después de C2 y pre-variance)
- `PRC_SOD_AGENDA_METRICAS_RECALCULAR_CORE_V1` (después de C2 y pre-variance)

**Impacto:** Las métricas de agenda y la invalidación de C3 posterior no se ejecutan desde ScriptCase.

---

### #7 — MEDIA: Granularidad de datos

**ScriptCase:** Retorna datos agrupados (SUM por tag+producto)
```sql
GROUP BY id_tag, id_producto
```

**API:** Retorna línea por línea (`id_conteo_det`)

**Impacto:** La API tiene más detalle, pero la lógica de negocio es la misma.

---

### #8 — MEDIA: Dispositivo

**ScriptCase:** `dispositivo = 'SGO_ANALISTA'`
**API:** `dispositivo = 'APP_TABLET'`

**Impacto:** Solo afecta auditoría y trazabilidad.

---

### #9 — MEDIA: Umbral configurable vs hardcodeado

**ScriptCase:** `$umbral_prevariance` viene de parámetro GET
**API:** Hardcodeado en `500000`

**Impacto:** No se puede cambiar el umbral sin modificar el código de la API.

---

### #10 — MEDIA: Creación de tags durante Pre-Variance

**ScriptCase:** Puede crear nuevos tags si no existen (con validación de zonificación)
**API:** Asume que los tags ya existen

**Impacto:** Si falta un tag, la API falla.

---

### #11 — MEDIA: Cierre Pre-Variance (solo API)

**ScriptCase:** No tiene tabla de cierre de pre-variance
**API:** Crea registro en `sod_inv_prevariance_cierre` con `estado_cierre = 'PENDIENTE_ENVIO'`

**Impacto:** El flujo de cierre es exclusivo de la API.

---

### #12 — MEDIA: Origen pattern diferente

**ScriptCase:** `SGO-VAL-{modo}-{agenda}-{tag}-{producto}-{ts}-{pos}`
**API:** `SGO-VAL-LINEA-{agenda}-{c1det}-{ts}-{pos}`

**Impacto:** Difícil rastrear registros entre sistemas.

---

### #13 — BAJA: Audit nivel de detalle

**ScriptCase:** Incluye `id_tienda`, `valor_anterior`, `valor_nuevo`
**API:** No incluye esos campos

---

### #14 — BAJA: id_motivo_correccion (solo API)

**API:** Usa `id_motivo_correccion` en INSERT de C2
**ScriptCase:** No usa esta columna

---

### #15 — BAJA: User data sec_users join (solo ScriptCase)

**ScriptCase:** JOIN `sec_users` para obtener RUT del operador
**API:** No hace este JOIN

---

### #16 — BAJA: Report structure

**ScriptCase:** Lista cronológica plana
**API:** Resumen pivoteado por iteración
