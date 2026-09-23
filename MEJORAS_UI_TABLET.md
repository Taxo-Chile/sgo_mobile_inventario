# Mejoras de UI para Tablet — sgo_mobile_inventario

> Documento de referencia para futuras actualizaciones de UI.
> No implementar hasta que el usuario lo solicite.

## Contexto

La aplicación es usada por analistas de inventario en tablets Android durante jornadas presenciales en tiendas SODIMAC. El uso es intensivo, con many touches por sesión, en condiciones de iluminación variable (bodega, piso de venta).

---

## 1. Navigation Rail en lugar de hamburger menu

**Problema actual:** El menú lateral se oculta detrás de un hamburger. El analista debe tocar para revelar la navegación, lo cual es lento y no aprovecha el espacio de tablet.

**Solución:** Implementar un navigation rail permanente en el lado izquierdo. En tablet landscape, siempre visible. En portrait, se colapsa a iconos.

**Referencia:**
- Android Large Screens: "Navigation rails replace navigation bars for better ergonomics"
- UXPin: "A navigation rail is a narrow vertical sidebar showing icon-and-label navigation items. Originally designed for tablets."

**Beneficio:** El analista ve las secciones (Home, Agenda, Pre-Variance, Recuento, Cierres) sin tocar nada. Reduce navigación de 2 taps a 1 tap.

---

## 2. Touch targets más grandes (48dp mínimo)

**Problema actual:** Algunos botones y elementos interactivos son pequeños para el uso con guantes o dedos sudados en tienda.

**Solución:** Asegurar que todo elemento interactivo tenga mínimo 48x48dp (Android) / 44x44pt (iOS). Incluye:
- Botones de acción (Confirmar, Modificar, Finalizar)
- Badges de estado
- Items de lista clickeables
- Iconos de navegación

**Referencia:**
- Android Quality Guidelines LS-U3: "Touch targets are at least 48dp"
- NN/g: "The touch-friendly size for buttons and other widgets is 1cm x 1cm or larger"

---

## 3. Layout list-detail para agenda

**Problema actual:** En tablet landscape, la pantalla muestra una lista de agendas que ocupa todo el ancho. Al tocar una, navega a una pantalla completa con solo 3 KPIs y-botones.

**Solución:** Implementar patrón list-detail:
- Panel izquierdo (~35%): lista de agendas con estado
- Panel derecho (~65%): detalle de la agenda seleccionada
- En portrait: mantener comportamiento actual (navegación completa)

**Referencia:**
- Android Canonical Layouts: "List-detail layout takes advantage of large screen space"
- Material Design: "Support screens of all sizes on devices of all kinds with responsive/adaptive layouts"

---

## 4. Pull-to-refresh en pantallas de datos

**Problema actual:** No hay forma de refrescar datos sin navegar fuera y volver.

**Solución:** Agregar `ion-refresher` a:
- Home (lista de agendas)
- Agenda Detail (tags)
- Tag Detail (capturas)
- Pre-Variance (productos)
- Recuento (productos)
- Cierres (estado)

**Referencia:**
- Ionic `ion-refresher` component
- Patrón estándar en todas las apps de inventario/warehouse

---

## 5. FAB (Floating Action Button) para acciones primarias

**Problema actual:** Los botones de acción están al fondo de la página (como "Finalizar Recuento"). En páginas largas, el analista debe hacer scroll para verlos.

**Solución:** Usar un FAB en la esquina inferior derecha para la acción principal de cada pantalla:
- Agenda Detail: FAB "Iniciar Conteo" (o similar)
- Pre-Variance: FAB "Finalizar Pre-Variance"
- Recuento: FAB "Finalizar Recuento"
- Tag Detail: FAB "Agregar Línea"

**Referencia:**
- Material Design: "A FAB provides a large and prominent button for the user. Provide only one action at a time."
- Android Layout Patterns: "For actions of the highest importance, a FAB provides a large and prominent button"

---

## 6. No estirar elementos al ancho completo

**Problema actual:** Cards y botones se estiran a todo el ancho de la tablet, lo cual se ve extraño en pantallas de 10"+.

**Solución:**
- Cards: max-width ~480px, centradas
- Botones de acción: max-width ~300px
- Dialogs/modals: max-width ~400px, nunca full-width
- Forms: max-width ~500px

**Referencia:**
- Android: "Constrain the width of buttons, cards, and text fields that are full width on small displays to a functionally appropriate size on large displays"
- ChromeOS Design: "Lists and menus shouldn't use the full screen width"

---

## 7. Tipografía más grande para distancia de lectura

**Problema actual:** Los font sizes son los mismos que para teléfono. En tablet, el usuario está más lejos de la pantalla.

**Solución:** Aumentar font sizes base en ~10-15%:
- Body text: 14px → 16px
- Labels: 11px → 12px
- Headings: ajustar proporcionalmente
- KPIs numéricos: mantener grandes (ya están bien)

**Referencia:**
- NN/g: "Avoid small fonts: They are hard to read on the web, and can be even harder to read on a small screen"
- ChromeOS Design: "Text shouldn't be excessively large or small on larger screen sizes"

---

## 8. Estados activos claros en navegación

**Problema actual:** En el menú lateral, no siempre es claro qué sección está activa.

**Solución:**
- Indicador de color de fondo en el item activo
- Icono en color primario cuando está seleccionado
- Texto en bold cuando está activo
- Opcional: indicador lateral (barra vertical) en el item activo

**Referencia:**
- UXPin: "Always indicate which navigation item is currently selected using color, weight, or an underline. Users should never have to guess where they are."

---

## Prioridad de implementación

| # | Mejora | Impacto | Esfuerzo | Prioridad |
|---|--------|---------|----------|-----------|
| 1 | Navigation Rail | Alto | Medio | Alta |
| 2 | Touch targets 48dp | Alto | Bajo | Alta |
| 4 | Pull-to-refresh | Medio | Bajo | Alta |
| 8 | Estados activos | Medio | Bajo | Alta |
| 5 | FAB acciones | Medio | Bajo | Media |
| 3 | List-detail agenda | Alto | Alto | Media |
| 6 | Max-width constraints | Bajo | Bajo | Baja |
| 7 | Tipografía tablet | Bajo | Bajo | Baja |
