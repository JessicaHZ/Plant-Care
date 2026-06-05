const assert = require('assert/strict')

const {
  getEligibleAchievements,
  getTotalCareErrors
} = require('../../main/domain/achievementRules')

function validateAchievementRules() {
  const statsWithErrors = {
    diagnosticos_correctos: 9,
    semana_simulada_actual: 1,
    errores_riego: 1,
    errores_abono: 0,
    errores_poda: 2,
    errores_ubicacion: 0
  }

  assert.equal(getTotalCareErrors(statsWithErrors), 3)

  assert.deepEqual(
    getEligibleAchievements({
      progress: { nivel: 1, racha_dias: 0 },
      stats: statsWithErrors,
      plants: []
    }).map(achievement => achievement.id),
    []
  )

  assert.deepEqual(
    getEligibleAchievements({
      progress: { nivel: 3, racha_dias: 10 },
      stats: {
        diagnosticos_correctos: 10,
        semana_simulada_actual: 1,
        errores_riego: 0,
        errores_abono: 0,
        errores_poda: 0,
        errores_ubicacion: 0
      },
      plants: [{}, {}, {}, {}, {}]
    }).map(achievement => achievement.id),
    [
      'primera_planta',
      'cinco_plantas',
      'primer_nivel',
      'planta_nivel3',
      'diagnostico_perfecto',
      'sin_errores_semana',
      'racha_5',
      'racha_10'
    ]
  )
}

module.exports = {
  validateAchievementRules
}
