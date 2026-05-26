# Seguridad de dependencias

## Deuda tecnica controlada: npm audit

Fecha de registro: 2026-05-26.

Se reviso el reporte de `npm audit` sin ejecutar `npm audit fix` ni actualizar versiones.

## Resumen de vulnerabilidades

El reporte mostro 7 vulnerabilidades:

- 1 de severidad baja.
- 1 de severidad moderada.
- 5 de severidad alta.
- 0 criticas.

Los paquetes reportados fueron:

- `electron-rebuild`
- `node-gyp`
- `make-fetch-happen`
- `cacache`
- `tar`
- `ip-address`
- `@tootallnate/once`

## Origen

Las vulnerabilidades provienen de la cadena de dependencias de `electron-rebuild`, que esta declarada en `devDependencies`.

La revision con dependencias de produccion no mostro estos paquetes como parte directa del runtime productivo del juego.

## Impacto real en la aplicacion

Actualmente no se considera que estas vulnerabilidades afecten directamente el runtime del juego, la simulacion, SQLite, la persistencia de partidas ni la interfaz del jugador.

El riesgo principal esta asociado al entorno de desarrollo e instalacion, especialmente a herramientas usadas para reconstruir modulos nativos y manejar paquetes comprimidos durante `npm install` o procesos similares.

## Decision

No se aplico `npm audit fix --force`.

Motivo: la correccion sugerida implica cambios mayores en dependencias de desarrollo y podria afectar la compatibilidad de reconstruccion de modulos nativos, especialmente `better-sqlite3`.

## Recomendacion futura

Evaluar en una tarea separada el reemplazo de `electron-rebuild` por `@electron/rebuild`.

Antes de adoptar el cambio se debe verificar:

- instalacion limpia de dependencias,
- reconstruccion correcta de `better-sqlite3`,
- arranque de Electron,
- persistencia y lectura de SQLite,
- compatibilidad con el empaquetado futuro de la aplicacion.
