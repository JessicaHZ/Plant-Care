# Arquitectura actual del proyecto

## Contexto

El proyecto mantiene una arquitectura Electron + JavaScript + SQLite local. La refactorizacion se esta realizando de forma gradual para mejorar modularidad sin modificar el comportamiento funcional del juego ni romper el instalador.

El modulo `main/database.js` se conserva como fachada publica de compatibilidad, pero el flujo principal ya no depende de ella para registrar IPC ni para iniciar/cerrar la base de datos. Esta decision permite mantener un contrato estable mientras el backend avanza hacia una organizacion por dominios.

## Estado de refactorizacion al 2026-06-05

- `main/database/lifecycle.js` concentra inicializacion de esquema, migraciones de arranque, seed del catalogo, migracion de logros legacy y guardado de ultimo cierre.
- `main/main.js` usa directamente `database/lifecycle.js`.
- Los handlers IPC estan separados en `main/ipc/handlers/` por dominio.
- `main/ipc-handlers.js` solo registra handlers; ya no importa `main/database.js`.
- Los handlers principales consumen services y repositories directamente, manteniendo los mismos canales IPC.
- `main/database.js` queda como fachada legacy/de compatibilidad y conserva sus exports publicos protegidos por validadores.
- `scripts/validators/databaseArchitectureValidator.js` protege que el flujo principal no vuelva a depender accidentalmente de la fachada.

## Estructura actual relevante

```text
main/
  database.js
  main.js
  ipc/
    handlers/
      achievementHandlers.js
      careHandlers.js
      minigameHandlers.js
      plantHandlers.js
      simulationProgressHandlers.js
      tutorialResetHandlers.js
      weeklyHandlers.js
    registerHandler.js
  database/
    connection.js
    lifecycle.js
    schema.js
    seeds/
      plantCatalog.js
    repositories/
      achievementRepository.js
      plantRepository.js
      progressRepository.js
      statsRepository.js
  domain/
    achievementDefinitions.js
    achievementRules.js
    careRules.js
    plantRules.js
    progressRules.js
    simulationRules.js
  services/
    achievementService.js
    plantCatalogService.js
    plantCollectionService.js
    plantPlacementService.js
    careService.js
    diagnosisService.js
    minigameService.js
    progressService.js
    quizService.js
    resetService.js
    simulationService.js
    statsService.js
    streakService.js
    weeklyReviewService.js
  utils/
    number-utils.js

renderer/
  js/
    config/
      careMessagesConfig.js
      defenseConfig.js
      diagnosisConfig.js
      profileConfig.js
      quizQuestionBank.js
      roomConfig.js
      weeklyReviewRecommendations.js
    utils/
      care-display-utils.js
      care-guide-display-utils.js
      care-panel-display-utils.js
      diagnosis-display-utils.js
      diagnosis-rules.js
      diagnosis-scenario-selector.js
      environment-display-utils.js
      nursery-display-utils.js
      profile-display-utils.js
      number-utils.js
      quiz-display-utils.js
      weekly-review-display-utils.js
    Environment.js
    Diagnosis.js
    CareActions.js
    Simulation.js
    ...

scripts/
  validate-rules.js
  validators/
    plantCatalogValidator.js
    plantCatalogServiceValidator.js
    plantCollectionServiceValidator.js
    plantPlacementServiceValidator.js
    plantRulesValidator.js
    careRulesValidator.js
    careServiceValidator.js
    diagnosisServiceValidator.js
    minigameServiceValidator.js
    achievementDefinitionsValidator.js
    achievementRulesValidator.js
    achievementServiceValidator.js
    progressRulesValidator.js
    progressServiceValidator.js
    quizServiceValidator.js
    resetServiceValidator.js
    simulationRulesValidator.js
    simulationServiceValidator.js
    statsServiceValidator.js
    streakServiceValidator.js
    weeklyReviewServiceValidator.js
    databaseFacadeValidator.js
```

## Flujo general

```text
renderer -> preload.js -> ipc-handlers.js -> database.js -> repositories -> SQLite
renderer -> preload.js -> ipc-handlers.js -> ipc/handlers/* -> services -> repositories -> SQLite
```

El renderer no accede directamente a Node.js ni a SQLite. Las operaciones pasan por la API expuesta en `preload.js`, los canales registrados en `ipc-handlers.js` y handlers especializados por dominio.

`main/ipc/registerHandler.js` centraliza el patron comun de registro IPC con manejo de errores y respuesta fallback. `ipc-handlers.js` conserva la orquestacion de registro, mientras los canales concretos viven en `main/ipc/handlers/`.

## Modulos de persistencia

### connection.js

Archivo: `main/database/connection.js`

Responsabilidad:

- Crear la conexion SQLite mediante `better-sqlite3`.
- Construir la ruta de la base de datos con `app.getPath('userData')`.
- Exportar la instancia compartida `db`.
- Exportar la ruta de base de datos para trazabilidad.

Este modulo no contiene reglas del juego ni queries de dominio.

### schema.js

Archivo: `main/database/schema.js`

Responsabilidad:

- Crear tablas mediante `CREATE TABLE IF NOT EXISTS`.
- Ejecutar migraciones seguras.
- Crear indices relacionados con el esquema.

Este modulo define estructura de datos. No decide XP, salud, logros, simulacion ni acciones de cuidado.

### lifecycle.js

Archivo: `main/database/lifecycle.js`

Responsabilidad:

- Inicializar esquema e indices.
- Ejecutar migraciones seguras de arranque.
- Migrar logros legacy.
- Sincronizar el catalogo inicial de plantas.
- Guardar el timestamp de ultimo cierre.

Este modulo representa el ciclo de vida tecnico de la base de datos. No registra canales IPC ni contiene reglas de cuidado, simulacion o logros.

### seeds/plantCatalog.js

Archivo: `main/database/seeds/plantCatalog.js`

Responsabilidad:

- Contener el catalogo estatico de 20 plantas.
- Mantener los datos educativos y botanicos fuera de `database.js`.
- Proveer los datos usados por el seed de catalogo durante `database/lifecycle.js`.

`database/lifecycle.js` coordina el seed durante la inicializacion, pero la decision de insertar o actualizar el catalogo se delega a `services/plantCatalogService.js`; las consultas SQL viven en `plantRepository.js`.

## Repositories

Los repositories concentran consultas directas a SQLite. Su responsabilidad es persistencia, no reglas de negocio.

### plantRepository.js

Responsabilidad:

- Consultar catalogo de plantas.
- Buscar plantas por id.
- Consultar plantas adquiridas.
- Insertar plantas adquiridas.
- Actualizar estado, ubicacion y slot.
- Eliminar o limpiar plantas del jugador.

No decide compatibilidad de luz, efectos por ubicacion, cuidado ni simulacion diaria.

### statsRepository.js

Responsabilidad:

- Obtener o crear la fila singleton de estadisticas.
- Incrementar contadores permitidos.
- Corregir y reiniciar contadores semanales.
- Limpiar estadisticas al reiniciar partida.

La decision sobre cuando incrementar cada contador sigue coordinada por `database.js` y reglas de dominio.

### progressRepository.js

Responsabilidad:

- Leer o crear progreso inicial.
- Actualizar campos de progreso.
- Guardar ultimo cierre.
- Persistir estado del tutorial.
- Reiniciar progreso.

No calcula XP, niveles, racha ni avance offline.

### achievementRepository.js

Responsabilidad:

- Migrar claves legacy de logros.
- Consultar logros obtenidos.
- Insertar logros.
- Listar logros para UI/perfil.
- Limpiar logros.

No decide cuando se desbloquean logros.

## Reglas de dominio

### plantRules.js

Archivo: `main/domain/plantRules.js`

Responsabilidad:

- Determinar condicion de luz por habitacion.
- Evaluar compatibilidad entre luz requerida y luz disponible.
- Calcular efecto de ubicacion sobre la salud.
- Calcular intervalo de poda segun `tipo_poda`.

Estas funciones son puras: no acceden a SQLite, no modifican estado y pueden validarse de forma aislada.

### careRules.js

Archivo: `main/domain/careRules.js`

Responsabilidad:

- Calcular resultado de riego.
- Calcular resultado de abono.
- Calcular resultado de drenaje.
- Calcular resultado de poda.

Este modulo devuelve decisiones puras: estado de la accion, XP, si fue error, cambios de estadisticas y cambios de estado necesarios. No guarda datos, no otorga XP directamente y no modifica rachas ni logros.

Las acciones de riego, abono, drenaje y poda ya estan delegadas en
`services/careService.js`. `database.js` conserva las fachadas publicas
`waterPlant(id_registro)`, `fertilizePlant(id_registro)`, `drainPlant(id_registro)`
y `prunePlant(id_registro)`, pero el servicio concentra la lectura de planta,
aplicacion de reglas puras, estadisticas, XP, racha y revision de logros.

### progressRules.js

Archivo: `main/domain/progressRules.js`

Responsabilidad:

- Definir el nivel maximo del jugador.
- Calcular nivel a partir de experiencia acumulada.
- Calcular el nuevo estado de progreso despues de otorgar XP.

Este modulo no persiste datos. `progressService.js` conserva la operacion de aplicacion
`addExperience()`: lee progreso, delega el calculo puro y guarda el resultado mediante
`progressRepository`.

### simulationRules.js

Archivo: `main/domain/simulationRules.js`

Responsabilidad:

- Calcular degradacion diaria de humedad.
- Calcular degradacion diaria de nutrientes.
- Calcular cambio de salud por humedad, nutrientes y ubicacion.
- Determinar estado de planta a partir de salud.
- Determinar si debe activarse la poda.

Este modulo ya cuenta con validaciones puras y esta conectado a `simulationService.js`
para humedad, nutrientes, salud diaria, estado final y activacion de poda. La coordinacion
de persistencia, muerte de plantas, racha, progreso y logros ya fue extraida de
`database.js` hacia `services/simulationService.js`.

## Configuracion del renderer

### careMessagesConfig.js

Archivo: `renderer/js/config/careMessagesConfig.js`

Responsabilidad:

- Contener guias contextuales educativas por tipo de error de cuidado.
- Contener pistas breves mostradas por el personaje guia ante errores repetidos.

`CareActions.js` conserva el flujo de ejecucion de acciones, diagnostico, persistencia y eventos, pero delega mensajes educativos estaticos en `CareMessagesConfig`.

### defenseConfig.js

Archivo: `renderer/js/config/defenseConfig.js`

Responsabilidad:

- Definir plagas, aliados, oleadas y velocidad maxima del minijuego defensa del brote.
- Separar datos estaticos del flujo de renderizado, animacion y persistencia de `MiniGameDefense.js`.

`MiniGameDefense.js` conserva la logica del minijuego y referencia `DefenseConfig` para mantener estable el comportamiento existente.

### diagnosisConfig.js

Archivo: `renderer/js/config/diagnosisConfig.js`

Responsabilidad:

- Centralizar etiquetas de acciones mostradas en el modal de diagnostico.
- Contener el catalogo estatico de escenarios educativos del diagnostico.
- Proveer un fallback textual para acciones no reconocidas.

`Diagnosis.js` conserva el flujo educativo, renderizado del modal, respuesta del jugador y comunicacion IPC, pero delega etiquetas y escenarios estaticos en `DiagnosisConfig`.

### profileConfig.js

Archivo: `renderer/js/config/profileConfig.js`

Responsabilidad:

- Definir niveles visibles del perfil.
- Definir XP minimo requerido por nivel.
- Contener el catalogo visible de logros mostrado en la pantalla de perfil.
- Contener patrones de recomendacion usados por estadisticas del perfil.

`ProfileScreen.js` conserva la carga y renderizado del perfil, pero delega datos estaticos de niveles, logros visibles y recomendaciones en `ProfileConfig`.

### quizQuestionBank.js

Archivo: `renderer/js/config/quizQuestionBank.js`

Responsabilidad:

- Contener el banco estatico de preguntas, opciones, respuestas correctas y explicaciones del quiz educativo.
- Separar contenido educativo del flujo de sesion, respuesta y persistencia de `MiniGameQuiz.js`.

`MiniGameQuiz.js` conserva la seleccion aleatoria, renderizado, registro de respuestas y resultado del minijuego, pero referencia `QuizQuestionBank.questions` como fuente de datos.

### roomConfig.js

Archivo: `renderer/js/config/roomConfig.js`

Responsabilidad:

- Definir habitaciones disponibles.
- Definir condicion de luz visual por habitacion.
- Definir slots fijos por habitacion.

`Environment.js` conserva `_rooms` y `_slots` como referencias a `RoomConfig.rooms` y `RoomConfig.slots` para mantener compatibilidad con `SlotEditor`.

### weeklyReviewRecommendations.js

Archivo: `renderer/js/config/weeklyReviewRecommendations.js`

Responsabilidad:

- Contener recomendaciones estaticas por tipo de error de cuidado.
- Separar textos de recomendacion del flujo de revision semanal.

`WeeklyReview.js` conserva activacion, renderizado, respuesta y persistencia de la revision, pero referencia `WeeklyReviewRecommendations.messages` para los consejos por patron de error.

## Utilidades del renderer

### care-display-utils.js

Archivo: `renderer/js/utils/care-display-utils.js`

Responsabilidad:

- Calcular etiquetas visuales de salud, humedad y nutrientes para el panel de cuidado.
- Construir el HTML de medidores de cuidado con valores normalizados.

`Environment.js` sigue coordinando la pantalla, carga de plantas y eventos del panel, pero delega estos detalles de presentacion en `CareDisplayUtils`.

### care-guide-display-utils.js

Archivo: `renderer/js/utils/care-guide-display-utils.js`

Responsabilidad:

- Construir el HTML del modal de guia contextual educativa de cuidado.
- Separar presentacion de guia contextual del flujo de ejecucion de acciones.

`CareActions.js` conserva la decision de cuando mostrar la guia y el cierre del modal, pero delega el HTML en `CareGuideDisplayUtils`.

### care-panel-display-utils.js

Archivo: `renderer/js/utils/care-panel-display-utils.js`

Responsabilidad:

- Construir el HTML del panel de cuidado de una planta viva.
- Construir el HTML del panel de una planta muerta.
- Reutilizar `CareDisplayUtils` para sprites, estados de poda y medidores.

`Environment.js` conserva el flujo de apertura, cierre, recarga de plantas, eventos y llamadas a `CareActions`, pero delega la plantilla visual del panel en `CarePanelDisplayUtils`.

### diagnosis-display-utils.js

Archivo: `renderer/js/utils/diagnosis-display-utils.js`

Responsabilidad:

- Normalizar valores de medidores usados en diagnostico educativo.
- Calcular etiquetas y estados visuales de humedad y salud.
- Construir el HTML de medidores de humedad y salud del modal de diagnostico.
- Construir mensajes visuales de resultado posteriores a la respuesta.

`Diagnosis.js` conserva los escenarios, seleccion contextual, respuesta del jugador y comunicacion IPC, pero delega la presentacion de medidores en `DiagnosisDisplayUtils`.

### diagnosis-rules.js

Archivo: `renderer/js/utils/diagnosis-rules.js`

Responsabilidad:

- Resolver la condicion de luz de una ubicacion para el diagnostico educativo.
- Evaluar compatibilidad entre luz requerida por la planta y luz disponible en la habitacion.
- Detectar si una planta esta en una ubicacion con luz inadecuada.
- Determinar si corresponde mostrar el diagnostico segun nivel, probabilidad y senales de riesgo.

`Diagnosis.js` conserva el flujo de interaccion y la lectura de progreso, pero delega reglas puras de activacion y luz en `DiagnosisRules`.

### diagnosis-scenario-selector.js

Archivo: `renderer/js/utils/diagnosis-scenario-selector.js`

Responsabilidad:

- Seleccionar el escenario educativo aplicable segun estado de planta, accion y condiciones de cuidado.
- Mantener la logica condicional de seleccion fuera de `Diagnosis.js`.

`Diagnosis.js` conserva el modal, la respuesta del jugador y la comunicacion IPC, pero delega la seleccion contextual en `DiagnosisScenarioSelector`.

### environment-display-utils.js

Archivo: `renderer/js/utils/environment-display-utils.js`

Responsabilidad:

- Definir mensajes visuales asociados a condiciones de luz.
- Construir el HTML de pregunta y resultado al colocar plantas en habitaciones.
- Mantener datos de presentacion del entorno fuera de `Environment.js`.

`Environment.js` conserva el flujo de colocacion, persistencia y listeners de modales, pero delega textos y HTML de modales de ubicacion en `EnvironmentDisplayUtils`.

### nursery-display-utils.js

Archivo: `renderer/js/utils/nursery-display-utils.js`

Responsabilidad:

- Definir colores e iconos visuales para tipo de planta, luz y dificultad.
- Resolver etiquetas de poda usadas por el detalle del vivero.

`Nursery.js` conserva la carga de catalogo, filtros, seleccion y adquisicion de plantas, pero delega datos de presentacion en `NurseryDisplayUtils`.

### profile-display-utils.js

Archivo: `renderer/js/utils/profile-display-utils.js`

Responsabilidad:

- Resolver colores visuales asociados a tipos de logro.
- Seleccionar el texto de recomendacion principal a partir de estadisticas.
- Calcular el modelo visual de progreso de nivel y XP.
- Mantener datos de presentacion de logros fuera de `ProfileScreen.js`.

`ProfileScreen.js` conserva la carga de progreso, estadisticas y logros, pero delega modelo visual de progreso, colores visuales y seleccion de recomendacion en `ProfileDisplayUtils`.

### quiz-display-utils.js

Archivo: `renderer/js/utils/quiz-display-utils.js`

Responsabilidad:

- Calcular el nivel visual del resultado final del quiz segun porcentaje de aciertos.
- Mantener mensajes e iconos de resultado fuera de `MiniGameQuiz.js`.

`MiniGameQuiz.js` conserva la sesion, respuesta, persistencia de resultado y flujo del minijuego, pero delega la presentacion final en `QuizDisplayUtils`.

### weekly-review-display-utils.js

Archivo: `renderer/js/utils/weekly-review-display-utils.js`

Responsabilidad:

- Calcular etiquetas visuales de frecuencia para errores semanales.
- Calcular anchos porcentuales de barras de comparacion en la revision semanal.

`WeeklyReview.js` conserva el flujo de revision, respuesta, persistencia y cierre del modal, pero delega calculos visuales en `WeeklyReviewDisplayUtils`.

## database.js como fachada

Archivo: `main/database.js`

`database.js` sigue existiendo como fachada de compatibilidad del proceso main. Conserva la API publica historica para evitar rupturas de contrato, pero el flujo principal de la aplicacion ya no la usa para iniciar la base de datos ni para registrar IPC.

El contrato publico vigente esta documentado en `docs/contrato-database.md`.

Actualmente delega en:

- `repositories/` para persistencia.
- `database/lifecycle.js` para inicializacion y guardado de ultimo cierre.
- `domain/plantRules.js` para reglas puras de luz y poda temporal.
- `domain/careRules.js` para calculos puros de acciones de cuidado.
- `domain/achievementDefinitions.js` para definiciones estaticas y claves legacy de logros.
- `domain/achievementRules.js` para reglas puras de elegibilidad de logros.
- `domain/progressRules.js` para calculos puros de XP y nivel.
- `domain/simulationRules.js` para reglas puras de simulacion diaria.
- `services/simulationService.js` para coordinar avance de dias simulados, persistencia, muerte de plantas, progreso y logros.
- `services/weeklyReviewService.js` para seleccion, activacion, normalizacion de payload y registro de revision semanal.
- `services/achievementService.js` para migrar claves legacy, revisar, construir e insertar logros sin duplicarlos.
- `services/plantCatalogService.js` para consultas y seed coordinado del catalogo de plantas.
- `services/plantCollectionService.js` para operaciones simples sobre coleccion de plantas.
- `services/plantPlacementService.js` para calcular resultado de ubicacion y compatibilidad de luz.
- `services/careService.js` para coordinar acciones de cuidado: riego, abono, drenaje y poda.
- `services/diagnosisService.js` para coordinar resultado de diagnostico educativo, XP, racha y logros.
- `services/minigameService.js` para coordinar recompensas, estadisticas y logros de minijuegos.
- `services/progressService.js` para progreso inicial, tutorial, normalizacion de nivel, suma de XP, migracion de dia actual, guardado de cierre y dias offline.
- `services/quizService.js` para calcular resultado y coordinar registro de quiz educativo.
- `services/resetService.js` para coordinar reinicio completo de partida.
- `services/statsService.js` para normalizar incrementos de estadisticas semanales.
- `services/streakService.js` para coordinar racha de cuidado responsable.

## Responsabilidades que aun permanecen en database.js

Por estabilidad, todavia permanecen en `database.js` como fachadas de compatibilidad:

- Coordinacion de XP y nivel.
- Fachada de simulacion diaria delegada en `simulationService`.
- Avance offline.
- Coordinacion de nueva partida mediante `resetService`.
- Fachadas publicas historicas usadas por validadores y por compatibilidad.

Estas areas no deben eliminarse en bloque. Cada reduccion futura debe ser pequena, validable y sin cambiar canales IPC ni forma de respuesta.

## Validacion tecnica

Se agrego una validacion ligera:

```text
scripts/validate-rules.js
scripts/validators/
```

`validate-rules.js` actua como orquestador. Los archivos en `scripts/validators/` agrupan validaciones pequenas por dominio para evitar que el script principal vuelva a crecer como modulo monolitico.

La validacion verifica:

- Catalogo de 20 plantas.
- Campos obligatorios del catalogo.
- `sprite_key` unicos.
- Reglas de luz y ubicacion.
- Intervalos de poda.
- Estados visuales y medidores del panel de cuidado.
- Mensajes visuales de luz y ubicacion del entorno.
- Resultado visual final del quiz educativo.
- Etiquetas y barras visuales de revision semanal.
- Reglas puras de riego, abono, drenaje y poda.
- Coordinacion de riego, abono, drenaje y poda mediante `careService`.
- Reglas puras de humedad, nutrientes, salud, estado de planta y activacion de poda.
- Configuracion estatica del minijuego defensa del brote.
- Banco estatico de preguntas del quiz educativo.
- Recomendaciones estaticas de revision semanal.
- Service de revision semanal.
- Service de simulacion diaria.
- Service de insercion de logros.
- Definiciones y claves legacy de logros.
- Reglas puras de elegibilidad de logros.
- Service de progreso offline.
- Service de racha de cuidado responsable.
- Service de reinicio de partida.
- Contrato publico de la fachada `database.js`.
- Arquitectura de base de datos: `main.js` usa `database/lifecycle.js`, `ipc-handlers.js` no importa la fachada y `database.js` conserva delegacion de ciclo de vida.

Comando:

```bash
npm.cmd run validate
```

Ciclo recomendado antes de aceptar un refactor:

```bash
npm.cmd run validate
npm.cmd run lint
npm.cmd run build
```

## Beneficios actuales

- `database.js` redujo responsabilidades y quedo como fachada legacy/de compatibilidad.
- El ciclo de vida de base de datos quedo separado en `database/lifecycle.js`.
- Los handlers IPC quedaron separados por dominio.
- El flujo principal ya no depende de la fachada `database.js`.
- Las reglas puras ya pueden validarse sin iniciar Electron.
- Los datos estaticos dejaron de vivir mezclados con coordinacion de base de datos.
- El renderer comenzo a separar configuracion visual de logica de pantalla.
- El instalador sigue estable porque `package.json` incluye `main/**/*`, `renderer/**/*` y `assets/**/*`.

## Riesgos vigentes

- `database.js` sigue siendo una fachada amplia; aunque ya no sostiene el flujo principal, conserva muchas funciones publicas por compatibilidad.
- El renderer depende de variables globales (`window.*`) y del orden de carga de scripts en `index.html`.
- Los handlers IPC comparten helpers repetidos para progreso, estadisticas, XP y logros; esta duplicacion puede centralizarse mas adelante.
- La cobertura automatica aun es ligera; no reemplaza pruebas manuales del flujo completo.
- `careService.js` y algunos validadores ya son los modulos mas largos del backend; futuras extracciones deben evitar crear nuevos monolitos de servicios.

## Recomendaciones futuras

Prioridad sugerida:

1. Mantener quietas las partes criticas ya validadas: persistencia, simulacion, cuidado, IPC y build.
2. Documentar `database.js` como fachada legacy/de compatibilidad hasta que deje de ser necesaria.
3. Extraer helpers repetidos de handlers a un modulo pequeno, por ejemplo `main/ipc/handlerDependencies.js`, de forma gradual.
4. Reorganizar el renderer gradualmente, empezando por pantallas criticas como `Environment.js`, `CareActions.js` o diagnostico.
5. Dejar minijuegos y CSS grande para una fase posterior, salvo bugs concretos.

No se recomienda por ahora:

- Eliminar `database.js`.
- Cambiar canales IPC.
- Reescribir `simulateDays()` o cambiar sus reglas.
- Mover reglas de logros y racha en el mismo cambio.
- Cambiar empaquetado Electron sin una razon tecnica concreta.
