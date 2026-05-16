const { contextBridge, ipcRenderer } = require('electron')

// Expone la API del juego al renderer de forma segura mediante contextBridge.
// El renderer accede a estas funciones como: window.gameAPI.nombreFuncion()
// Nunca se expone ipcRenderer directamente — cada función es un wrapper
// que solo puede invocar canales IPC explícitamente definidos aquí.
contextBridge.exposeInMainWorld('gameAPI', {

  getVersion: () => process.versions.electron,

  // ── Catálogo de plantas ───────────────────────────────────────────────
  getAllPlants:  ()          => ipcRenderer.invoke('plants:getAll'),
  getPlantById: (id_planta) => ipcRenderer.invoke('plants:getById', id_planta),

  // ── Colección del jugador ─────────────────────────────────────────────
  getUserPlants: () => ipcRenderer.invoke('plants:getUserPlants'),
  acquirePlant:  (id_planta) => ipcRenderer.invoke('plants:acquire', id_planta),
  deletePlant: (id_registro) => ipcRenderer.invoke('plants:delete', id_registro),

  // ── Entorno ───────────────────────────────────────────────────────────
  // RF-02, RF-03: coloca o mueve una planta a un espacio del entorno.
  placePlant: (id_registro, ubicacion, pos_x, pos_y) =>
  ipcRenderer.invoke('plant:place', { id_registro, ubicacion, pos_x, pos_y }),

  // ── Simulación ────────────────────────────────────────────────────────
  advanceDays: (days) => ipcRenderer.invoke('simulation:advance', days),

  // ── Acciones de cuidado ───────────────────────────────────────────────
  // RF-07: regar. RF-08: abonar. RF-09: podar (requiere nivel >= 2).
  waterPlant:     (id_registro) => ipcRenderer.invoke('care:water',     id_registro),
  fertilizePlant: (id_registro) => ipcRenderer.invoke('care:fertilize', id_registro),
  prunePlant:     (id_registro) => ipcRenderer.invoke('care:prune',     id_registro),

  // ── Diagnóstico previo (RF-31 / LM4 — Analizar) ──────────────────────
  // Se llama antes de habilitar cualquier acción de cuidado.
  submitDiagnosis: (wasCorrect) =>
    ipcRenderer.invoke('diagnosis:submit', wasCorrect),


  // ── Progreso y estadísticas ───────────────────────────────────────────
  getProgress: () => ipcRenderer.invoke('progress:get'),
  getStats:    () => ipcRenderer.invoke('stats:get'),

  // ── Minijuegos ────────────────────────────────────────────────────────
  // HU-14: quiz de preguntas.
  submitQuiz: (correct) => ipcRenderer.invoke('quiz:submit', correct),

  // HU-13: minijuego de plagas.
  completePestsGame: (correct) =>
    ipcRenderer.invoke('minigame:pests:complete', correct),

  // ── Revisión semanal activa (RF-32 / LM5 — Evaluar) ──────────────────
  getTopActions:       ()           => ipcRenderer.invoke('weekly:getTopActions'),
  submitWeeklyReview:  (wasCorrect) => ipcRenderer.invoke('weekly:submit', wasCorrect),
  shouldTriggerWeekly: (currentDay) => ipcRenderer.invoke('weekly:shouldTrigger', currentDay),
  fixWeeklyCounter: (value) => ipcRenderer.invoke('stats:fixWeekly', value),

  clearUserPlants: () => ipcRenderer.invoke('plants:clear'),
  updatePlantLocation: (id_registro) =>
   ipcRenderer.invoke('plants:moveToRoom', { id_registro }),

  getOfflineDays: () => ipcRenderer.invoke('simulation:getOfflineDays'),

  getAchievements: () => ipcRenderer.invoke('achievements:get'),

  grantQuizPerfectAchievement: () =>
  ipcRenderer.invoke('achievements:grantQuizPerfect'),
  

})