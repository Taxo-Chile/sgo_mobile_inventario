# SGO Mobile Inventario

Aplicación tablet para validación de inventario - SGO

## Stack

- Angular 20.3.25
- Ionic 8
- Capacitor 8.4.1
- TypeScript 5.9
- Tailwind CSS 3.4
- Clean Architecture

## Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo con API mockup
npm run start:mockup

# Desarrollo con API real
npm run start:dev
```

## Arquitectura

```
src/app/
├── core/           # Servicios core (HTTP, database)
├── domain/         # Modelos y repositorios (entidades)
├── application/    # Casos de uso
├── data/           # Implementación de repositorios (API)
├── state/          # Estado global (signals)
├── features/       # Páginas y componentes
└── shared/         # Servicios y componentes compartidos
```

## Flujo de Validación

1. Login → Obtener token
2. Seleccionar tienda (agenda)
3. Ver TAGs (Altillos/PDV)
4. Abrir TAG → Ver capturas C1
5. Validar cada captura: Confirmar o Modificar (C2)
6. Confirmar TAG completo

## API

Endpoints en `sodimac-ws/api/tablet/`:
- `login.php` - Autenticación
- `agendas.php` - Lista de tiendas
- `agenda-detalle.php` - Detalle de agenda
- `tags.php` - TAGs por agenda
- `tag-detalle.php` - Detalle de TAG
- `capturas.php` - Capturas del TAG
- `validacion/guardar.php` - Guardar validación
- `validacion/confirmar.php` - Confirmar TAG
