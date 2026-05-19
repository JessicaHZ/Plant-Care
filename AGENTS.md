# AGENTS.md — Contexto del proyecto "my-plant-home"

Resumen breve
- Nombre: my-plant-home
- Versión: 1.0.0
- Descripción: Serious game - simulador de cuidado de plantas
- Tipo de proyecto: Aplicación de escritorio basada en Electron (CommonJS)
- Entrada principal: `main/main.js`

package.json (resumen)
- `main`: main/main.js
- `scripts`:
  - `start`: electron .
  - `dev`: electron . --inspect
- `dependencies`:
  - better-sqlite3 ^12.9.0
- `devDependencies`:
  - electron ^41.3.0
  - electron-rebuild ^3.2.9

  ---

## 📌 Contexto del proyecto

**my-plant-home** es un serious game de escritorio desarrollado con Electron y JavaScript vanilla.
Su propósito es enseñar el cuidado correcto de plantas mediante simulación interactiva
y mecánicas de aprendizaje activo basadas en la metodología LM-GM (Learning Mechanics –
Game Mechanics) y la Taxonomía de Bloom.

**Stack técnico:**
- Runtime: Electron (proceso main + renderer)
- Lenguaje: JavaScript vanilla (sin frameworks frontend)
- Base de datos: SQLite via better-sqlite3 (local, sin nube)
- Estilos: CSS puro con variables globales
- Sin autenticación: sesión local única, sin login ni registro

---

Estructura de carpetas (resumen relevante)
- assets/
  - sprites/
    - plants/
    - rooms/
- main/
  - database.js          — lógica de BD (Better SQLite3)
  - ipc-handlers.js      — handlers IPC entre main y renderer
  - main.js              — proceso principal de Electron
  - preload.js           — script preload (contextBridge si aplica)
- renderer/
  - index.html
  - index.js             — bootstrap del renderer
  - js/
    - CareActions.js
    - Diagnosis.js
    - Environment.js
    - MiniGamePests.js
    - MiniGameQuiz.js
    - Nursery.js
    - PlayerHUD.js
    - ProfileScreen.js
    - ScreenManager.js
    - Simulation.js
    - Tutorial.js
    - WeeklyReview.js
  - styles/
    - diagnosis.css
    - environment.css
    - global.css
    - menu.css
    - minigames.css
    - navbar.css
    - Nursery.css
    - profile.css
    - Splash.css

---

## 🏗️ Arquitectura y patrones clave

### Flujo de datos
```
renderer (JS) → preload.js → ipc-handlers.js → database.js → SQLite
```
El renderer NUNCA accede directamente a Node.js ni a la BD.
Todo pasa por canales IPC definidos en `ipc-handlers.js` y expuestos
en `preload.js` como `window.gameAPI.*`.

### Pantallas (SPA)
Todas las pantallas son `div.screen` en `index.html`.
`ScreenManager.show('nombre')` activa una y oculta las demás via CSS.
La pantalla inicial es `main-menu` — no hay splash ni login.

### Eventos globales (window)
Los módulos se comunican sin acoplamiento directo via `CustomEvent` en `window`:
- `window.dispatchEvent(new CustomEvent('xp:gained', { detail: xpResult }))`
- `window.dispatchEvent(new CustomEvent('simulation:tick', { detail: { day, results } }))`
- `window.dispatchEvent(new CustomEvent('plant:acquired'))`

Todos los listeners de estos eventos están en `index.js` registrados UNA sola vez.

### Delegación de eventos en modales
Los modales (Diagnosis, WeeklyReview, MiniGamePests, MiniGameQuiz) usan
UN solo listener delegado en el overlay en lugar de listeners por botón.
Esto evita acumulación de handlers.

---

## 🗄️ Base de datos

**Tablas activas:**

| Tabla | Descripción |
|---|---|
| `plantas` | Catálogo de 20 especies reales (inmutable) |
| `plantas_usuario` | Instancias adquiridas por el jugador |
| `progreso` | Singleton: nivel, experiencia, racha_dias, ultimo_cierre |
| `estadisticas` | Singleton: contadores de errores y acciones |
| `logros` | Logros obtenidos por el jugador |

**Reglas de la BD:**
- Sin tabla `usuarios` — la autenticación fue eliminada del alcance
- `progreso` y `estadisticas` son singletons (siempre una sola fila)
- `plantas_usuario` permite múltiples instancias del mismo `id_planta`
- `pos_x` y `pos_y` en `plantas_usuario` guardan posición en % dentro del room-area
- Todas las migraciones de columnas nuevas van en el array `safeMigrations`

---

## 🎮 Mecánicas LM-GM (no modificar sin justificación)

Estas tres mecánicas son el núcleo educativo del proyecto.
Están alineadas con la Taxonomía de Bloom y son requisitos funcionales obligatorios:

| RF | Mecánica | Cuándo | Bloom |
|---|---|---|---|
| RF-31 | Diagnóstico previo (`Diagnosis.js`) | Antes de CUALQUIER acción de cuidado | Analizar |
| RF-32 | Revisión semanal (`WeeklyReview.js`) | Al completar 7 días simulados | Evaluar |
| RF-33 | Pregunta proactiva (`Environment.js`) | Al colocar/mover una planta | Comprender |

**Regla crítica:** RF-31 siempre permite proceder independientemente de si el jugador
acierta o falla — el aprendizaje ocurre en la explicación, no en el bloqueo.

---

## ⚙️ Sistema de simulación de tiempo

El tiempo es híbrido:
- **Automático:** 1 día de juego = 10 minutos reales (`Simulation.MS_PER_GAME_DAY`)
- **Manual:** botón "Avanzar día" en el entorno
- **Offline:** al reabrir, calcula días transcurridos (máximo 3 días)

**Protecciones anti-bug:**
- `_isAdvancing` en `Simulation.js` evita avances simultáneos
- `cloneNode` en `_bindSimulation()` limpia listeners del botón en cada init
- `_tickHandler` en `Environment.js` se remueve antes de agregar en cada init
- `_running` en `WeeklyReview.js` evita modales simultáneos

---

## 📐 Estilo de código

### Principios generales
- **Clean Code** y principios **SOLID** en toda decisión de diseño
- Soluciones modulares y escalables sobre hacks o parches rápidos
- Nombres descriptivos en **inglés** para variables, funciones y propiedades
- Comentarios en **español** para contexto de negocio y requisitos

### JavaScript
```js
// ✅ Correcto
async function waterPlant(id_registro) { ... }
const pruneAvailable = plant.tipo_poda !== 'NUNCA' && plant.requiere_poda_activa === 1

// ❌ Evitar
function wp(id) { ... }
const x = plant.tp !== 'N' && plant.rpa
```

### Funciones de database.js
- Las funciones singleton (sin parámetro de usuario) operan sobre la única fila
- Siempre usar `getProgress()` y `getStats()` para leer el estado actual
- Nunca acceder a tablas eliminadas (`usuarios`, `BD_usuario`)
- Toda función nueva debe agregarse al `module.exports`

### Eventos IPC
- Nombrar canales como `dominio:accion` — ejemplo: `plants:acquire`, `care:water`
- El handler en `ipc-handlers.js` siempre tiene try/catch
- El preload siempre recibe parámetros mínimos (sin `id_usuario`)

### CSS
- Variables globales definidas en `global.css` — nunca hardcodear colores
- Una pantalla = un archivo CSS
- Clases BEM-like: `.module-elemento--modificador`

---

## 🚫 Reglas estrictas

1. **No reescribir módulos completos** — refactorizar quirúrgicamente
2. **No agregar autenticación** — fue eliminada del alcance intencionalmente
3. **No usar `id_usuario`** en ninguna función nueva — no existe
4. **No romper las mecánicas LM-GM** (RF-31, RF-32, RF-33)
5. **No usar `document.getElementById` dentro de modales** — usar `overlay.querySelector`
6. **No registrar listeners duplicados** — siempre verificar si ya existe antes de agregar
7. **No usar `localStorage` o `sessionStorage`** — todo persiste en SQLite
8. **No agregar dependencias npm** sin justificación técnica clara
9. **No hacer cambios visuales mientras haya requisitos funcionales pendientes**
10. **No usar `MiniGamePruning.js`** — ese archivo fue eliminado del proyecto

---

## ✅ Requisitos funcionales pendientes

Al momento de escribir este archivo, estos RF aún no están implementados:

- [ ] **RF-22** — Racha diaria con requisito educativo
- [ ] **RF-21** — Sistema de logros (tabla existe, falta asignar)
- [ ] **RF-25** — Contenido adaptado por nivel del jugador
- [ ] **RF-27** — Tutorial inicial interactivo
- [ ] **RF-28/29** — Guías contextuales reactivas ante errores repetidos

---

## 🧪 Cómo probar cambios

Antes de considerar un cambio como completo:

1. Verificar en consola de DevTools que no hay errores
2. Probar el flujo completo de la funcionalidad modificada
3. Verificar que los módulos adyacentes no se rompieron
4. Confirmar que los datos persisten al cerrar y reabrir la app

Para abrir DevTools en Electron durante desarrollo:
```js
// En main.js — solo activo cuando app.isPackaged === false
gameWindow.webContents.openDevTools({ mode: 'detach' })
```

---

## 📦 Comandos útiles

```bash
# Iniciar la aplicación
npm start

# Limpiar la BD de prueba (elimina game.db)
# Windows:
del "%APPDATA%\PLANT_SIMULATOR\game.db"
```
