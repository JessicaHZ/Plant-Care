const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateProfileDisplayUtils() {
  const utilsPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'profile-display-utils.js')
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { ProfileDisplayUtils } = sandbox.window

  assert.ok(ProfileDisplayUtils, 'ProfileDisplayUtils debe exponerse en window')
  assert.strictEqual(ProfileDisplayUtils.getAchievementTypeColor('PROGRESO'), '#66bb6a')
  assert.strictEqual(ProfileDisplayUtils.getAchievementTypeColor('EDUCATIVO'), '#42a5f5')
  assert.strictEqual(ProfileDisplayUtils.getAchievementTypeColor('RACHA'), '#ffa726')
  assert.strictEqual(ProfileDisplayUtils.getAchievementTypeColor('EVALUACION'), '#ab47bc')
  assert.strictEqual(ProfileDisplayUtils.getAchievementTypeColor('SIN_DATO'), '#fff')

  const patterns = [
    { statKey: 'errores_riego', message: 'Revisar riego' },
    { statKey: 'errores_abono', message: 'Revisar abono' }
  ]

  assert.strictEqual(
    ProfileDisplayUtils.getRecommendationText(
      { errores_riego: 1, errores_abono: 3 },
      patterns,
      'Sin errores'
    ),
    'Revisar abono'
  )
  assert.strictEqual(
    ProfileDisplayUtils.getRecommendationText(
      { errores_riego: 0, errores_abono: 0 },
      patterns,
      'Sin errores'
    ),
    'Sin errores'
  )

  const levels = [
    { nivel: 1, titulo: 'Aprendiz', xpMin: 0 },
    { nivel: 2, titulo: 'Cuidador', xpMin: 100 },
    { nivel: 3, titulo: 'Jardinero', xpMin: 250 }
  ]
  const progressView = ProfileDisplayUtils.getProgressViewModel({
    progress: { nivel: 2, experiencia: 175 },
    levels
  })

  assert.strictEqual(progressView.level, 2)
  assert.strictEqual(progressView.xp, 175)
  assert.strictEqual(progressView.levelData.titulo, 'Cuidador')
  assert.strictEqual(progressView.nextLevel.nivel, 3)
  assert.strictEqual(progressView.xpProgress, 50)
  assert.strictEqual(progressView.nextXpText, '250 XP para nivel 3')

  const maxProgressView = ProfileDisplayUtils.getProgressViewModel({
    progress: { nivel: 9, experiencia: 500 },
    levels
  })

  assert.strictEqual(maxProgressView.level, 3)
  assert.strictEqual(maxProgressView.xpProgress, 100)
}

module.exports = { validateProfileDisplayUtils }
