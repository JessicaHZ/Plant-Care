# Arquitectura actual del modulo de base de datos

## Contexto

El proyecto mantiene una arquitectura Electron + JavaScript + SQLite. La refactorizacion actual se realizo de forma gradual para reducir el tamano de `main/database.js` sin modificar el comportamiento funcional del juego.

El modulo `main/database.js` sigue siendo el punto publico principal usado por IPC y por otros modulos del proceso main. Internamente, algunas responsabilidades de persistencia ya fueron separadas en archivos especializados.

## Estructura actual

```text
main/
  database.js
  database/
    connection.js
    schema.js
    repositories/
      achievementRepository.js
      plantRepository.js
      progressRepository.js
      statsRepository.js
  utils/
    number-utils.js
```

## connection.js

Archivo: `main/database/connection.js`

Responsabilidad:

- Crear la conexion SQLite con `better-sqlite3`.
- Construir la ruta de la base de datos usando `app.getPath('userData')`.
- Exportar la instancia compartida `db`.
- Exportar `DB_PATH` para trazabilidad y mensajes de inicializacion.

Este modulo no contiene queries de negocio ni reglas del juego.

## schema.js

Archivo: `main/database/schema.js`

Responsabilidad:

- Crear tablas SQLite mediante `CREATE TABLE IF NOT EXISTS`.
- Ejecutar migraciones seguras con `ALTER TABLE`.
- Crear indices relacionados con el schema.

Este modulo se limita a estructura de datos. No decide reglas de XP, logros, simulacion, rachas ni cuidado de plantas.

## Repositories

Los repositories concentran consultas directas a SQLite. Su objetivo es aislar persistencia y reducir acoplamiento en `database.js`.

### plantRepository.js

Archivo: `main/database/repositories/plantRepository.js`

Responsabilidad:

- Consultar catalogo de plantas.
- Buscar plantas por id.
- Consultar plantas adquiridas por el jugador.
- Insertar plantas adquiridas.
- Actualizar estado, ubicacion y slot de plantas.
- Eliminar plantas del jugador.
- Limpiar la coleccion de plantas.

No contiene reglas como compatibilidad de luz, penalizacion por ubicacion incorrecta, simulacion diaria o cuidado.

### statsRepository.js

Archivo: `main/database/repositories/statsRepository.js`

Responsabilidad:

- Obtener o crear la fila singleton de estadisticas.
- Incrementar contadores permitidos.
- Corregir el contador semanal.
- Reiniciar contadores semanales.
- Limpiar estadisticas al reiniciar partida.

Las decisiones sobre cuando incrementar cada estadistica siguen en `database.js`.

### progressRepository.js

Archivo: `main/database/repositories/progressRepository.js`

Responsabilidad:

- Leer y crear progreso inicial.
- Actualizar campos de progreso.
- Guardar ultimo cierre.
- Persistir estado del tutorial.
- Reiniciar progreso al iniciar una nueva partida.

No calcula XP, nivel, racha ni avance offline.

### achievementRepository.js

Archivo: `main/database/repositories/achievementRepository.js`

Responsabilidad:

- Migrar claves legacy de logros.
- Consultar ids de logros obtenidos.
- Insertar logros.
- Listar logros para UI/perfil.
- Limpiar logros al reiniciar partida.

No decide cuando se desbloquea un logro.

## database.js como fachada

Archivo: `main/database.js`

`database.js` sigue funcionando como fachada porque otros modulos del proyecto ya dependen de sus funciones publicas. Mantener esta fachada evita romper IPC, preload, renderer y pruebas manuales existentes.

Actualmente `database.js` coordina repositories y conserva la API publica del sistema. Por ejemplo, otros archivos pueden seguir usando:

- `getUserPlants()`
- `acquirePlant()`
- `updateStats()`
- `getProgress()`
- `addExperience()`
- `checkAndGrantAchievements()`
- `simulateDays()`

Internamente, varias de esas funciones ya delegan persistencia a repositories.

## Reglas de negocio que siguen en database.js

Por ahora se mantienen en `database.js` las reglas de negocio principales:

- Calculo de XP y nivel.
- Reglas de racha de cuidado responsable.
- Simulacion diaria de plantas.
- Efectos de humedad, salud, nutrientes y poda.
- Evaluacion de muerte de plantas.
- Compatibilidad de luz y penalizacion por ubicacion incorrecta.
- Decision de que estadisticas incrementar.
- Decision de que logros desbloquear.
- Revision semanal.
- Calculo de avance offline.
- Coordinacion de nueva partida.

Estas reglas no se movieron para evitar cambios funcionales durante la refactorizacion inicial.

## Beneficios de la refactorizacion

- Menor acoplamiento entre conexion, schema y consultas.
- `database.js` queda mas preparado para dividirse en services.
- Las queries directas estan mejor localizadas.
- Se reduce el riesgo de modificar accidentalmente reglas de juego al tocar persistencia.
- La estructura facilita pruebas futuras por modulo.
- Se mantiene compatibilidad con la API publica existente.

## Recomendaciones futuras

La siguiente etapa natural es crear services de dominio, manteniendo cambios pequenos y verificables:

- `plantService`: reglas de compra, ubicacion, cuidado y eliminacion.
- `simulationService`: avance diario, efectos de salud, muerte y recuperacion.
- `progressService`: XP, nivel, tutorial, avance offline y nueva partida.
- `achievementService`: reglas de desbloqueo de logros.
- `streakService`: racha de cuidado responsable.
- `weeklyReviewService`: revision semanal y reinicio de contadores.

Antes de mover reglas a services se recomienda:

- Agregar pruebas unitarias o scripts de validacion para flujos criticos.
- Mantener `database.js` como fachada temporal hasta estabilizar imports.
- Migrar una responsabilidad por etapa.
- Ejecutar `npm run lint` y validaciones manuales despues de cada cambio.
- Evitar cambios simultaneos en UI, IPC y persistencia durante una misma etapa.
