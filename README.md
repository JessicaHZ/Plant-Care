# My Plant Home
<img width="1408" height="768" alt="Gemini_Generated_Image_xa7rrxa7rrxa7rrx" src="https://github.com/user-attachments/assets/334e03e8-e8fa-4a86-9bf9-9f74050e90ac" />

Serious game de escritorio desarrollado con Electron, JavaScript y SQLite local. El objetivo del juego es enseñar conceptos básicos de cuidado de plantas mediante observación, diagnóstico, toma de decisiones y consecuencias simuladas en el tiempo.

## Descripción General

El jugador puede adquirir plantas desde un vivero, colocarlas en distintas habitaciones, observar su estado y aplicar acciones de cuidado como regar, abonar, drenar o podar. El juego simula el paso de los días y modifica la salud de las plantas según humedad, nutrientes, ubicación, luz y errores de cuidado.

El proyecto también incluye minijuegos, sistema de XP, niveles, logros, tutorial inicial, estadísticas y revisión semanal del desempeño.

## Tecnologías Utilizadas

- Electron
- JavaScript
- HTML
- CSS
- SQLite local
- better-sqlite3

## Funcionalidades Principales

- Catálogo de plantas con datos educativos.
- Adquisición de plantas.
- Colocación de plantas en habitaciones.
- Impacto real de la ubicación según tipo de luz.
- Simulación temporal por días.
- Humedad, salud y nutrientes por planta.
- Acciones de cuidado:
  - Regar
  - Abonar
  - Drenar
  - Podar
- Diagnóstico previo a acciones de cuidado.
- Sistema de XP y niveles.
- Logros y estadísticas.
- Revisión semanal de errores.
- Evaluación positiva cuando no se cometen errores.
- Minijuegos de refuerzo:
  - Quiz de plantas
  - Defensa del brote
  - Práctica de poda

## Requisitos Previos

Antes de ejecutar el proyecto, instalar:

- Node.js
- npm

Se recomienda usar una versión reciente de Node.js.

Para verificar la instalación:

```bash
node -v
npm -v
```

## Cómo Descargar el Proyecto

### Opción 1: Clonar desde Git

```bash
git clone URL_DEL_REPOSITORIO
cd mi-proyecto/plant_simulator
```

### Opción 2: Descargar ZIP

1. Descargar el proyecto como archivo `.zip`.
2. Extraerlo en una carpeta local.
3. Entrar a la carpeta:

```bash
cd mi-proyecto/plant_simulator
```

## Instalación

Instalar las dependencias:

```bash
npm install
```

## Ejecutar el Juego

Para iniciar la aplicación:

```bash
npm start
```

También puede ejecutarse en modo desarrollo:

```bash
npm run dev
```

## Base de Datos

El juego utiliza una base de datos SQLite local mediante `better-sqlite3`.

La base de datos se crea automáticamente al iniciar la aplicación. No es necesario crearla manualmente.

El archivo de base de datos se guarda en la carpeta de datos de usuario de Electron, no dentro del código fuente del proyecto.

## Estructura General

```txt
plant_simulator/
├── main/
│   ├── main.js
│   ├── preload.js
│   ├── ipc-handlers.js
│   └── database.js
├── renderer/
│   ├── index.html
│   ├── index.js
│   ├── js/
│   ├── styles/
│   └── assets/
├── package.json
└── README.md
```

## Archivos Importantes

- `main/database.js`: lógica de base de datos, simulación, progreso, estadísticas y cuidado de plantas.
- `main/ipc-handlers.js`: comunicación entre Electron y la interfaz.
- `main/preload.js`: API segura expuesta al renderer.
- `renderer/index.js`: inicialización de pantallas, navegación y eventos globales.
- `renderer/js/Environment.js`: habitaciones, colocación de plantas y panel de cuidado.
- `renderer/js/CareActions.js`: flujo de acciones de cuidado.
- `renderer/js/Diagnosis.js`: diagnóstico previo.
- `renderer/js/WeeklyReview.js`: revisión semanal.
- `renderer/js/MiniGameQuiz.js`: quiz educativo.
- `renderer/js/MiniGameDefense.js`: minijuego de defensa.
- `renderer/js/MiniGamePruning.js`: práctica de poda.

## Posibles Problemas

### Error con `better-sqlite3`

Si aparece un error relacionado con `better-sqlite3`, intentar:

```bash
npm rebuild
```

Si el problema continúa:

```bash
npx electron-rebuild
```

Luego volver a ejecutar:

```bash
npm start
```

### La aplicación no inicia

Verificar que se instalaron las dependencias:

```bash
npm install
```

Verificar que se está ejecutando desde la carpeta correcta:

```bash
cd mi-proyecto/plant_simulator
npm start
```

### Cambios no reflejados

Cerrar completamente la aplicación y volver a iniciarla:

```bash
npm start
```

Algunos cambios en base de datos o migraciones se aplican al iniciar la app.

## Notas Para Desarrollo

- No subir `node_modules` al repositorio.
- No editar manualmente la base de datos local salvo que sea necesario para pruebas.
- Antes de modificar mecánicas principales, revisar `database.js`.
- Mantener coherencia entre requisitos, mecánicas educativas y comportamiento real del código.

## Comandos Útiles

Ejecutar la app:

```bash
npm start
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Verificar sintaxis de archivos importantes:

```bash
node --check main/database.js
node --check main/ipc-handlers.js
node --check main/preload.js
node --check renderer/index.js
```

## Estado Actual

El proyecto es una versión jugable funcional de un serious game educativo sobre cuidado de plantas. Incluye simulación, retroalimentación, progreso, errores semanales y minijuegos de apoyo.
```

