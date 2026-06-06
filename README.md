# My Plant Home

**My Plant Home** es un serious game educativo de escritorio desarrollado con Electron.
El proyecto simula el cuidado de plantas en un entorno domestico y busca reforzar
conceptos basicos de observacion, diagnostico, toma de decisiones y consecuencias
simuladas en el tiempo.

El jugador adquiere plantas, las coloca en distintas habitaciones, revisa sus
necesidades y aplica acciones de cuidado como regar, abonar
salud de cada planta cambia segun humedad, nutrientes, ubicacion, luz y decisiones
del jugador.

## Objetivo Del Proyecto

El objetivo principal es presentar una experiencia educativa interactiva donde el
usuario aprenda principios de cuidado vegetal mediante practica guiada. El juego
combina simulacion, retroalimentacion inmediata, diagnosticos, logros, estadisticas
y minijuegos de refuerzo.

## Funcionalidades Principales

- Vivero con catalogo de plantas.
- Adquisicion de plantas para la coleccion del jugador.
- Habitaciones con condiciones de luz diferentes.
- Colocacion y movimiento de plantas dentro del entorno.
- Simulacion del paso de dias.
- Variables por planta: salud, humedad, nutrientes, estado y ubicacion.
- Acciones de cuidado: riego, abono, drenaje y poda.
- Diagnostico educativo antes de acciones importantes.
- Sistema de experiencia, niveles, progreso y racha.
- Logros y estadisticas del jugador.
- Revision semanal de errores frecuentes.
- Tutorial y personaje guia.
- Minijuegos educativos de refuerzo.
- Persistencia local con SQLite.
- Instalador de Windows generado con Electron Builder.

## Tecnologias Utilizadas

- Electron
- JavaScript vanilla
- HTML
- CSS
- SQLite local
- better-sqlite3
- Electron Builder
- ESLint
- Prettier

## Requisitos Previos

Instalar Node.js y npm.

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

## Ejecucion

Para iniciar la aplicacion en modo local:

```bash
npm start
```

## Validacion Del Proyecto

Antes de entregar, subir cambios o generar instalador, se recomienda ejecutar:

```bash
npm.cmd run validate
npm.cmd run lint
npm.cmd run build
```

Estos comandos verifican:

- Reglas puras del dominio.
- Contratos principales de servicios y fachada de base de datos.
- Calidad estatica con ESLint.
- Generacion correcta del instalador Electron.

## Instalador

El instalador de Windows se genera con:

```bash
npm.cmd run build
```

Ruta de salida:

```txt
dist/build/My Plant Home-1.0.0-Setup.exe
```

La configuracion del instalador se encuentra en `package.json`, dentro de la
propiedad `build`.

## Base De Datos Y Persistencia

El proyecto usa SQLite local mediante `better-sqlite3`. La base de datos se crea
automaticamente al iniciar la aplicacion y se guarda en la carpeta de datos de
usuario administrada por Electron.

La persistencia esta organizada en:

```txt
main/database/
  connection.js
  schema.js
  lifecycle.js
  seeds/
  repositories/
```

`main/database.js` permanece como fachada publica de compatibilidad. La logica se
ha modularizado gradualmente hacia repositorios, reglas de dominio y servicios
para reducir acoplamiento sin romper los canales IPC existentes.

## Arquitectura General

Flujo simplificado:

```txt
Renderer
  -> preload.js
  -> IPC handlers
  -> services / domain rules
  -> repositories
  -> SQLite
```

Organizacion relevante:

```txt
plant_simulator/
  main/
    main.js
    preload.js
    ipc-handlers.js
    ipc/
      handlers/
      handlerDependencies.js
      registerHandler.js
    database.js
    database/
      connection.js
      schema.js
      lifecycle.js
      repositories/
      seeds/
    domain/
    services/
    utils/

  renderer/
    index.html
    index.js
    js/
      config/
      utils/
      CareActions.js
      Diagnosis.js
      Environment.js
      Guide.js
      Nursery.js
      ProfileScreen.js
      Simulation.js
      Tutorial.js
      WeeklyReview.js
    styles/

  assets/
    icons/
    sprites/

  scripts/
    validate-rules.js
    validators/

  docs/
```

## Documentacion Tecnica

- `docs/arquitectura.md`: descripcion de la arquitectura actual.
- `docs/contrato-database.md`: contrato publico de `main/database.js`.
- `docs/seguridad-dependencias.md`: notas de seguridad y dependencias.

## Estado Actual Del Proyecto

El proyecto se encuentra en una version funcional y presentable para entrega. La
refactorizacion se ha realizado de forma gradual, priorizando estabilidad sobre
reescrituras completas.

Areas ya modularizadas:

- Repositorios de base de datos.
- Reglas puras en `main/domain/`.
- Servicios de cuidado, simulacion, progreso, racha, logros, minijuegos,
  diagnostico, quiz, revision semanal y reinicio.
- Handlers IPC separados por responsabilidad.
- Validadores ligeros por dominio.
- CSS principal dividido por componentes y pantallas.
- Utilidades visuales del renderer separadas progresivamente.

Areas que aun pueden mejorarse despues de la entrega:

- Division adicional de `renderer/js/Environment.js`.
- Reorganizacion gradual de pantallas grandes del renderer.
- Refactorizacion de minijuegos.
- Limpieza adicional de CSS especifico por pantalla.

## Notas Para Desarrollo

- No subir `node_modules`.
- No subir carpetas generadas como `dist/` o `.cache/`, salvo que se quiera
  publicar manualmente un instalador como release.
- Mantener `database.js` como fachada mientras existan dependencias desde IPC.
- No cambiar canales IPC sin revisar `preload.js` y los usos en renderer.
- Antes de modificar simulacion, racha, progreso, logros o persistencia, ejecutar
  `validate`, `lint` y `build`.

## Autora

Proyecto desarrollado como serious game educativo sobre cuidado de plantas.
