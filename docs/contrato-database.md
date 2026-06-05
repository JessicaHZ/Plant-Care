# Contrato tecnico de `main/database.js`

## Proposito

`main/database.js` actua como fachada publica del proceso main. Su contrato es relevante porque `main/ipc-handlers.js` consume sus funciones y el renderer accede a ellas indirectamente mediante `preload.js`.

Durante la modularizacion gradual, este archivo puede delegar mas responsabilidades a repositorios, reglas puras o services, pero debe conservar su API publica hasta que se planifique una migracion coordinada de IPC, preload y renderer.

## Regla de estabilidad

Antes de mover o renombrar una funcion exportada por `database.js`, se debe verificar:

- Si existe un canal IPC que la consume.
- Si `preload.js` expone ese canal al renderer.
- Si el renderer espera una forma especifica de respuesta.
- Si `scripts/validators/databaseFacadeValidator.js` debe actualizarse.
- Si el cambio requiere documentar una migracion de contrato.

## Contrato por dominio

### Inicializacion

| Funcion | Consumidor principal | Responsabilidad |
| --- | --- | --- |
| `initializeDatabase` | `main/main.js` | Inicializar esquema, migraciones, indices, catalogo y logros legacy mediante servicios internos. |

### Catalogo de plantas

| Funcion | Canal IPC asociado | Responsabilidad |
| --- | --- | --- |
| `getAllPlants` | `plants:getAll` | Obtener todas las plantas disponibles en el vivero mediante `plantCatalogService`. |
| `getPlantById` | `plants:getById` | Obtener detalle de una planta del catalogo mediante `plantCatalogService`. |
| `seedPlants` | Inicializacion interna | Insertar o actualizar catalogo mediante `plantCatalogService`. |

### Plantas del jugador

| Funcion | Canal IPC asociado | Responsabilidad |
| --- | --- | --- |
| `getUserPlants` | `plants:getUserPlants` | Obtener plantas adquiridas por el jugador mediante `plantCollectionService`. |
| `acquirePlant` | `plants:acquire` | Comprar/adquirir una planta mediante `plantCollectionService` y revisar logros relacionados. |
| `deletePlant` | `plants:delete` | Eliminar una planta de la coleccion mediante `plantCollectionService`. |
| `updatePlantState` | Uso interno actual | Actualizar campos de estado de una planta adquirida mediante `plantCollectionService`. |
| `placePlantInRoom` | `plant:place` | Colocar una planta mediante `plantCollectionService` y evaluar compatibilidad de luz mediante `plantPlacementService`. |
| `clearUserPlants` | `plants:clear` | Limpiar la coleccion de plantas mediante `plantCollectionService`. |
| `returnPlantToPanel` | `plants:moveToRoom` | Regresar una planta al panel sin ubicacion activa mediante `plantCollectionService`. |

### Progreso y estadisticas

| Funcion | Canal IPC asociado | Responsabilidad |
| --- | --- | --- |
| `getProgress` | `progress:get` | Obtener o crear progreso del jugador mediante `progressService`. |
| `updateProgress` | Uso interno actual | Actualizar campos de progreso mediante `progressService`. |
| `addExperience` | Uso por IPC indirecto | Sumar XP, recalcular nivel y devolver resultado compatible mediante `progressService`. |
| `migrateCurrentDayFromPlantState` | Inicializacion interna | Migrar `dia_actual` desde plantas existentes mediante `progressService`. |
| `getStats` | `stats:get` | Obtener o crear estadisticas del jugador mediante `statsService`. |
| `updateStats` | Uso por IPC indirecto | Incrementar estadisticas y contadores semanales asociados mediante `statsService`. |
| `fixWeeklyCounter` | `stats:fixWeekly` | Corregir contador semanal mediante `statsService`. |

### Simulacion

| Funcion | Canal IPC asociado | Responsabilidad |
| --- | --- | --- |
| `simulateDays` | `simulation:advance` | Avanzar dias simulados mediante `simulationService`, actualizar plantas, progreso, racha y logros. |
| `saveLastClose` | Uso desde ciclo de vida Electron | Guardar la fecha de ultimo cierre mediante `progressService`. |
| `getOfflineDays` | `simulation:getOfflineDays` | Calcular dias transcurridos fuera de la aplicacion mediante `progressService`. |

### Acciones de cuidado

| Funcion | Canal IPC asociado | Responsabilidad |
| --- | --- | --- |
| `waterPlant` | `care:water` | Aplicar accion de riego mediante `careService` y persistir sus consecuencias. |
| `fertilizePlant` | `care:fertilize` | Aplicar accion de abono mediante `careService` y persistir sus consecuencias. |
| `drainPlant` | `care:drain` | Aplicar accion de drenaje mediante `careService` y persistir sus consecuencias. |
| `prunePlant` | `care:prune` | Aplicar accion de poda mediante `careService` y persistir sus consecuencias. |

### Revision semanal y minijuegos

| Funcion | Canal IPC asociado | Responsabilidad |
| --- | --- | --- |
| `getTopActions` | `weekly:getTopActions` | Obtener acciones con mas errores para revision semanal. |
| `normalizeWeeklyReview` | `weekly:submit` | Normalizar payload de revision semanal mediante `weeklyReviewService`. |
| `recordWeeklyReview` | `weekly:submit` | Registrar revision semanal, reiniciar contadores mediante `statsService` y otorgar XP si corresponde. |
| `shouldTriggerWeeklyReview` | `weekly:shouldTrigger` | Determinar si debe mostrarse revision semanal. |
| `recordQuizResult` | `quiz:submit` | Registrar resultado del quiz con reglas calculadas por `quizService`. |
| `recordDiagnosisResult` | `diagnosis:submit` | Registrar resultado del diagnostico mediante `diagnosisService`. |
| `completeDefenseGame` | `minigame:defense:complete` | Registrar recompensa de Defensa del Brote mediante `minigameService`. |

### Logros y racha

| Funcion | Canal IPC asociado | Responsabilidad |
| --- | --- | --- |
| `getAchievements` | `achievements:get` | Obtener logros para perfil/interfaz mediante `achievementService`. |
| `checkAndGrantAchievements` | Uso por IPC indirecto | Revisar y otorgar logros generales mediante `achievementService`. |
| `grantQuizPerfectAchievement` | `achievements:grantQuizPerfect` | Otorgar logro especifico del quiz perfecto mediante `achievementService`. |
| `updateStreak` | Uso interno actual | Actualizar racha mediante `streakService`. |
| `recordResponsibleCareSession` | Uso por IPC indirecto | Registrar sesion responsable mediante `streakService`. |

### Tutorial y reinicio

| Funcion | Canal IPC asociado | Responsabilidad |
| --- | --- | --- |
| `isTutorialCompleted` | `tutorial:isCompleted` | Consultar mediante `progressService` si el tutorial fue completado. |
| `completeTutorial` | `tutorial:complete` | Marcar tutorial como completado mediante `progressService`. |
| `resetTutorial` | `tutorial:reset` | Reiniciar estado del tutorial mediante `progressService`. |
| `resetGame` | `game:reset` | Reiniciar progreso, estadisticas, logros y plantas mediante `resetService`. |

## Validacion automatizada relacionada

El archivo `scripts/validators/databaseFacadeValidator.js` valida que `database.js` conserve exactamente las funciones publicas esperadas. Esta validacion no prueba el comportamiento completo de cada funcion, pero protege contra cambios accidentales de contrato durante refactors graduales.

Comando recomendado:

```bash
npm.cmd run validate
```

## Candidatos para modularizacion futura

### Bajo riesgo

- Extraer calculos puros adicionales siempre que no accedan a SQLite.

### Riesgo medio

- Ampliar `progressService.js` de forma gradual manteniendo `database.js` como fachada.
- Ampliar `achievementRules.js` hacia logros especiales, sin cambiar canales IPC.
- Ampliar `weeklyReviewService.js` de forma gradual, manteniendo `database.js` como fachada.

### Riesgo alto

- Mover `simulateDays()` completo.
- Cambiar la forma de respuesta de acciones de cuidado.
- Cambiar nombres de funciones exportadas.
- Cambiar canales IPC o API expuesta por `preload.js`.
