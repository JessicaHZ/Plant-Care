const { db } = require('../connection')

function getProgress() {
  return db.prepare(`SELECT * FROM progreso LIMIT 1`).get()
}

function createInitialProgress() {
  db.prepare(`INSERT INTO progreso (nivel, experiencia, racha_dias) VALUES (1, 0, 0)`).run()
  return getProgress()
}

function updateProgress(fields) {
  const keys = Object.keys(fields)
  const setClause = keys.map(k => `${k} = @${k}`).join(', ')
  db.prepare(`UPDATE progreso SET ${setClause}`).run(fields)
}

function saveLastClose(timestamp) {
  db.prepare(`UPDATE progreso SET ultimo_cierre = ?`).run(timestamp)
}

function isTutorialCompleted() {
  const progress = db.prepare('SELECT tutorial_completado FROM progreso LIMIT 1').get()
  return progress ? progress.tutorial_completado === 1 : false
}

function completeTutorial() {
  db.prepare('UPDATE progreso SET tutorial_completado = 1').run()
}

function resetTutorial() {
  db.prepare('UPDATE progreso SET tutorial_completado = 0').run()
}

function resetProgress() {
  db.prepare('UPDATE progreso SET nivel = 1, experiencia = 0, racha_dias = 0, dia_actual = 1, tutorial_completado = 0, ultimo_cierre = NULL').run()
}

module.exports = {
  getProgress,
  createInitialProgress,
  updateProgress,
  saveLastClose,
  isTutorialCompleted,
  completeTutorial,
  resetTutorial,
  resetProgress
}
