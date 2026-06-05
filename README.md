# My Plant Home

Serious game de escritorio desarrollado con Electron, JavaScript vanilla y SQLite local. Su objetivo es ensenar conceptos basicos de cuidado de plantas mediante observacion, diagnostico, toma de decisiones y consecuencias simuladas en el tiempo.

## Descripcion general

El jugador puede adquirir plantas desde un vivero, colocarlas en distintas habitaciones, observar su estado y aplicar acciones de cuidado como regar, abonar, drenar o podar.

El juego simula el paso de los dias y modifica la salud de las plantas segun humedad, nutrientes, ubicacion, luz y errores de cuidado. Tambien incluye XP, niveles, logros, tutorial, estadisticas, revision semanal y minijuegos educativos.

## Tecnologias

- Electron
- JavaScript vanilla
- HTML
- CSS
- SQLite local
- better-sqlite3
- electron-builder
- ESLint
- Prettier

## Funcionalidades principales

- Catalogo de plantas con datos educativos.
- Compra/adquisicion de plantas.
- Colocacion de plantas en habitaciones.
- Impacto de la luz segun ubicacion.
- Simulacion temporal por dias.
- Humedad, salud y nutrientes por planta.
- Acciones de cuidado: regar, abonar, drenar y podar.
- Diagnostico previo a acciones de cuidado.
- Sistema de XP y niveles.
- Sistema de logros y estadisticas.
- Revision semanal de errores.
- Minijuegos de refuerzo: quiz, defensa del brote y practica de poda.

## Requisitos previos

Instalar Node.js y npm.

Verificar instalacion:

```bash
node -v
npm -v
```

## Instalacion

Entrar a la carpeta del proyecto:

```bash
cd mi-proyecto/plant_simulator
```

Instalar dependencias:

```bash
npm install
```

## Ejecutar la aplicacion

```bash
npm start
```

No existe un script `npm run dev` en la configuracion actual. Para desarrollo se usa `npm start`.

## Validacion y calidad

Ejecutar validaciones puras de reglas:

```bash
npm.cmd run validate
```

Ejecutar ESLint:

```bash
npm.cmd run lint
```

Generar instalador de Windows:

```bash
npm.cmd run build
```

Ciclo recomendado antes de aceptar cambios:

```bash
npm.cmd run validate
npm.cmd run lint
npm.cmd run build
```

## Instalador

El instalador se genera con `electron-builder`.

Ruta de salida:

```txt
dist/build/My Plant Home-1.0.0-Setup.exe
```

La configuracion del build se encuentra en `package.json`, dentro de la propiedad `build`.

## Base de datos

El juego usa SQLite local mediante `better-sqlite3`.

La base de datos se crea automaticamente al iniciar la aplicacion. El archivo no se guarda dentro del codigo fuente, sino en la carpeta de datos de usuario de Electron.

La conexion y el esquema se organizan en:

```txt
main/database/connection.js
main/database/schema.js
```

## Arquitectura resumida

Flujo principal:

```txt
renderer -> preload.js -> ipc-handlers.js -> database.js -> repositories -> SQLite
```

`main/database.js` sigue funcionando como fachada publica del proceso main. La modularizacion se realiza de forma gradual para no romper IPC, preload, renderer ni el instalador.

## Estructura relevante

```txt
plant_simulator/
  main/
    main.js
    preload.js
    ipc-handlers.js
    ipc/
      registerHandler.js
    database.js
    database/
      connection.js
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
    index.html
    index.js
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
      CareActions.js
      Diagnosis.js
      Simulation.js
      WeeklyReview.js
      MiniGameQuiz.js
      MiniGameDefense.js
      MiniGamePruning.js
    styles/

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

  docs/
    arquitectura.md
    contrato-database.md
    seguridad-dependencias.md
```

## Archivos importantes

- `main/database.js`: fachada principal; coordina persistencia, simulacion, progreso, estadisticas, racha y logros.
- `main/database/repositories/`: consultas directas a SQLite.
- `main/database/seeds/plantCatalog.js`: catalogo estatico de plantas.
- `main/domain/achievementDefinitions.js`: definiciones estaticas y claves legacy de logros.
- `main/domain/achievementRules.js`: reglas puras de elegibilidad de logros.
- `main/services/achievementService.js`: migracion legacy, revision, construccion e insercion segura de logros.
- `main/services/plantCatalogService.js`: consultas y seed coordinado del catalogo de plantas.
- `main/services/plantCollectionService.js`: operaciones simples sobre coleccion de plantas.
- `main/services/plantPlacementService.js`: resultado de ubicacion y compatibilidad de luz.
- `main/services/careService.js`: coordinacion de acciones de cuidado: riego, abono, drenaje y poda.
- `main/services/diagnosisService.js`: coordinacion del resultado de diagnostico educativo.
- `main/services/minigameService.js`: coordinacion de recompensas de minijuegos.
- `main/services/progressService.js`: progreso inicial, tutorial, normalizacion de nivel, suma de XP, migracion de dia actual, guardado de cierre y calculo de dias offline.
- `main/services/quizService.js`: resultado y coordinacion de registro del quiz educativo.
- `main/services/resetService.js`: coordinacion de reinicio completo de partida.
- `main/services/statsService.js`: normalizacion de estadisticas semanales.
- `main/services/streakService.js`: coordinacion de racha de cuidado responsable.
- `main/domain/plantRules.js`: reglas puras de luz, ubicacion e intervalos de poda.
- `main/domain/careRules.js`: reglas puras de riego, abono, drenaje y poda.
- `main/domain/progressRules.js`: reglas puras de XP y nivel.
- `main/domain/simulationRules.js`: reglas puras de simulacion diaria.
- `main/services/simulationService.js`: coordinacion de avance de dias simulados.
- `main/services/weeklyReviewService.js`: reglas, normalizacion de payload y registro de revision semanal.
- `main/ipc-handlers.js`: canales IPC entre main y renderer.
- `main/ipc/registerHandler.js`: helper comun para registrar handlers IPC con fallback de error.
- `main/preload.js`: API segura expuesta al renderer.
- `renderer/js/config/careMessagesConfig.js`: guias e indicaciones educativas para errores de cuidado.
- `renderer/js/config/defenseConfig.js`: configuracion estatica del minijuego defensa del brote.
- `renderer/js/config/diagnosisConfig.js`: etiquetas de acciones y escenarios educativos del diagnostico.
- `renderer/js/config/profileConfig.js`: niveles, logros y recomendaciones estaticas del perfil.
- `renderer/js/config/quizQuestionBank.js`: banco estatico de preguntas del quiz educativo.
- `renderer/js/config/roomConfig.js`: habitaciones y slots visuales.
- `renderer/js/config/weeklyReviewRecommendations.js`: recomendaciones estaticas de revision semanal.
- `renderer/js/utils/care-display-utils.js`: estados y HTML de medidores del panel de cuidado.
- `renderer/js/utils/care-guide-display-utils.js`: HTML del modal de guia contextual de cuidado.
- `renderer/js/utils/care-panel-display-utils.js`: HTML del panel de cuidado y del panel de planta muerta.
- `renderer/js/utils/diagnosis-display-utils.js`: medidores, estados y mensajes visuales del diagnostico educativo.
- `renderer/js/utils/diagnosis-rules.js`: reglas puras de activacion y compatibilidad de luz del diagnostico.
- `renderer/js/utils/diagnosis-scenario-selector.js`: seleccion contextual de escenarios del diagnostico.
- `renderer/js/utils/environment-display-utils.js`: mensajes visuales y modales de ubicacion del entorno.
- `renderer/js/utils/nursery-display-utils.js`: iconos, colores y etiquetas visuales del vivero.
- `renderer/js/utils/profile-display-utils.js`: progreso, colores de logros y recomendacion visual del perfil.
- `renderer/js/utils/quiz-display-utils.js`: resultado visual final del quiz educativo.
- `renderer/js/utils/weekly-review-display-utils.js`: etiquetas y barras visuales de revision semanal.
- `renderer/js/Environment.js`: pantalla de entorno, habitaciones, plantas colocadas y panel de cuidado.
- `scripts/validate-rules.js`: orquestador de la validacion ligera.
- `scripts/validators/`: validadores pequenos por dominio.
- `docs/arquitectura.md`: descripcion tecnica de la arquitectura actual.
- `docs/contrato-database.md`: contrato publico de la fachada `database.js`.

## Validacion ligera

`scripts/validate-rules.js` ejecuta validadores pequenos que verifican:

- Catalogo de 20 plantas.
- Campos obligatorios del catalogo.
- `sprite_key` unicos.
- Reglas de luz y ubicacion.
- Estados visuales y medidores del panel de cuidado.
- Mensajes visuales de luz y ubicacion del entorno.
- Resultado visual final del quiz educativo.
- Etiquetas y barras visuales de revision semanal.
- Reglas puras de cuidado.
- Service de riego, abono, drenaje y poda.
- Service de diagnostico educativo.
- Configuracion estatica del minijuego defensa del brote.
- Banco estatico de preguntas del quiz educativo.
- Recomendaciones estaticas de revision semanal.
- Service de recompensas de minijuegos.
- Reglas puras de progreso.
- Reglas puras de simulacion.
- Service de simulacion diaria.
- Service de racha de cuidado responsable.
- Service de revision semanal.
- Service de insercion de logros.
- Definiciones y claves legacy de logros.
- Reglas puras de elegibilidad de logros.
- Service de progreso offline.
- Service de reinicio de partida.
- Contrato publico de la fachada `database.js`.

## Posibles problemas

### Error con better-sqlite3

Intentar:

```bash
npm rebuild
```

Si el problema continua:

```bash
npx electron-rebuild
```

Luego ejecutar:

```bash
npm start
```

### La aplicacion no inicia

Verificar dependencias:

```bash
npm install
```

Verificar ubicacion:

```bash
cd mi-proyecto/plant_simulator
npm start
```

### Cambios no reflejados

Cerrar completamente la aplicacion y volver a iniciar:

```bash
npm start
```

Algunos cambios de base de datos o migraciones se aplican al iniciar la app.

## Notas de desarrollo

- No subir `node_modules`.
- No editar manualmente la base de datos local salvo para pruebas controladas.
- Mantener `database.js` como fachada mientras se estabilizan los modulos internos.
- No cambiar canales IPC sin revisar `preload.js` y renderer.
- Antes de tocar simulacion, XP, racha o logros, ejecutar `validate`, `lint` y `build`.
- Mantener coherencia entre requisitos, documentacion, arquitectura y codigo.

## Estado actual

El proyecto es una version jugable funcional de un serious game educativo sobre cuidado de plantas. La arquitectura backend ya fue modularizada gradualmente: `database.js` permanece como fachada publica, mientras reglas, servicios y repositorios concentran la mayor parte de la logica interna.

## Diagnostico post-refactor

Partes estabilizadas:

- Repositories para persistencia SQLite.
- Reglas puras en `main/domain/`.
- Services para catalogo, coleccion, cuidado, progreso, simulacion, logros, racha, quiz, revision semanal y reinicio.
- Validaciones ligeras por dominio en `scripts/validators/`.
- Build del instalador Electron validado con `npm.cmd run build`.

Partes que conviene no tocar de golpe:

- `database.js`, porque sigue siendo contrato de fachada para IPC.
- `ipc-handlers.js` y `preload.js`, porque definen la comunicacion main-renderer.
- `simulateDays()` y sus reglas, salvo cambios pequenos y validados.

Siguiente etapa recomendada:

- Validar manualmente la simulacion diaria extraida a `simulationService`.
- Luego evaluar una reorganizacion gradual del renderer, empezando por archivos grandes como `Environment.js`, `Diagnosis.js` o los minijuegos.
