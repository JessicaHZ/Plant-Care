const assert = require('assert/strict')

const {
  ACHIEVEMENTS,
  LEGACY_ACHIEVEMENT_KEYS
} = require('../../main/domain/achievementDefinitions')

function validateAchievementDefinitions() {
  const requiredAchievementIds = [
    'primera_planta',
    'cinco_plantas',
    'primer_nivel',
    'planta_nivel3',
    'diagnostico_perfecto',
    'sin_errores_semana',
    'racha_5',
    'racha_10',
    'evaluacion_correcta',
    'quiz_perfecto'
  ]

  assert.deepEqual(Object.keys(ACHIEVEMENTS).sort(), [...requiredAchievementIds].sort())

  for (const id of requiredAchievementIds) {
    const achievement = ACHIEVEMENTS[id]
    assert.equal(achievement.id, id)
    assert.equal(typeof achievement.nombre, 'string')
    assert.equal(achievement.nombre.length > 0, true)
    assert.equal(typeof achievement.descripcion, 'string')
    assert.equal(achievement.descripcion.length > 0, true)
    assert.equal(typeof achievement.tipo, 'string')
    assert.equal(achievement.tipo.length > 0, true)
  }

  assert.equal(LEGACY_ACHIEVEMENT_KEYS['Primer Brote'], 'primera_planta')
  assert.equal(LEGACY_ACHIEVEMENT_KEYS['Pequeño Jardín'], 'cinco_plantas')
  assert.equal(LEGACY_ACHIEVEMENT_KEYS['Ojo Clínico'], 'diagnostico_perfecto')
  assert.equal(LEGACY_ACHIEVEMENT_KEYS['Maestro Botanista'], 'quiz_perfecto')
}

module.exports = {
  validateAchievementDefinitions
}
