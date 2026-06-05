const { ACHIEVEMENTS } = require('./achievementDefinitions')

function getTotalCareErrors(stats) {
  return stats.errores_riego +
    stats.errores_abono +
    stats.errores_poda +
    stats.errores_ubicacion
}

function getEligibleAchievements({ progress, stats, plants }) {
  const eligibleAchievements = []

  if (plants.length >= 1) {
    eligibleAchievements.push(ACHIEVEMENTS.primera_planta)
  }

  if (plants.length >= 5) {
    eligibleAchievements.push(ACHIEVEMENTS.cinco_plantas)
  }

  if (progress.nivel >= 2) {
    eligibleAchievements.push(ACHIEVEMENTS.primer_nivel)
  }

  if (progress.nivel >= 3) {
    eligibleAchievements.push(ACHIEVEMENTS.planta_nivel3)
  }

  if (stats.diagnosticos_correctos >= 10) {
    eligibleAchievements.push(ACHIEVEMENTS.diagnostico_perfecto)
  }

  if (stats.semana_simulada_actual >= 1 && getTotalCareErrors(stats) === 0) {
    eligibleAchievements.push(ACHIEVEMENTS.sin_errores_semana)
  }

  if (progress.racha_dias >= 5) {
    eligibleAchievements.push(ACHIEVEMENTS.racha_5)
  }

  if (progress.racha_dias >= 10) {
    eligibleAchievements.push(ACHIEVEMENTS.racha_10)
  }

  return eligibleAchievements
}

module.exports = {
  getEligibleAchievements,
  getTotalCareErrors
}
