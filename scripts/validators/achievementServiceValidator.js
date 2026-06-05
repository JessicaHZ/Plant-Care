const assert = require('assert/strict')

const {
  ACHIEVEMENTS
} = require('../../main/domain/achievementDefinitions')
const {
  buildAchievementRecord,
  checkAndGrantAchievements,
  getAchievements,
  grantAchievement,
  grantQuizPerfectAchievement,
  migrateLegacyAchievements
} = require('../../main/services/achievementService')

function validateAchievementService() {
  const progress = { nivel: 3 }
  const achievement = ACHIEVEMENTS.primera_planta
  const record = buildAchievementRecord(achievement, progress)

  assert.deepEqual(record, {
    id: achievement.id,
    nombre: achievement.nombre,
    descripcion: achievement.descripcion,
    fecha: '3',
    tipo: achievement.tipo
  })

  const inserted = []
  const achievements = [{ id: 'primera_planta' }]
  const achievementRepository = {
    getAchievements: () => achievements,
    getAchievementIds: () => inserted.map(item => item.id),
    insertAchievement: item => inserted.push(item)
  }

  assert.equal(getAchievements(achievementRepository), achievements)
  assert.equal(
    grantAchievement({
      achievementRepository,
      achievement,
      progress
    }),
    true
  )
  assert.equal(inserted.length, 1)
  assert.equal(
    grantAchievement({
      achievementRepository,
      achievement,
      progress
    }),
    false
  )
  assert.equal(inserted.length, 1)

  const quizProgress = { nivel: 4 }
  assert.equal(
    grantQuizPerfectAchievement({
      achievementRepository,
      achievement: ACHIEVEMENTS.quiz_perfecto,
      getProgress: () => quizProgress
    }),
    true
  )
  assert.equal(inserted.length, 2)
  assert.deepEqual(inserted[1], {
    id: ACHIEVEMENTS.quiz_perfecto.id,
    nombre: ACHIEVEMENTS.quiz_perfecto.nombre,
    descripcion: ACHIEVEMENTS.quiz_perfecto.descripcion,
    fecha: '4',
    tipo: ACHIEVEMENTS.quiz_perfecto.tipo
  })
  assert.equal(
    grantQuizPerfectAchievement({
      achievementRepository,
      achievement: ACHIEVEMENTS.quiz_perfecto,
      getProgress: () => quizProgress
    }),
    false
  )
  assert.equal(inserted.length, 2)

  const progressWithAchievements = { nivel: 3, racha_dias: 5 }
  const statsWithAchievements = {
    diagnosticos_correctos: 10,
    errores_riego: 1,
    errores_abono: 0,
    errores_poda: 0,
    errores_ubicacion: 0,
    semana_simulada_actual: 0
  }
  const plantsWithAchievements = [
    { id_registro: 1 },
    { id_registro: 2 },
    { id_registro: 3 },
    { id_registro: 4 },
    { id_registro: 5 }
  ]
  const grantedCount = checkAndGrantAchievements({
    achievementRepository,
    getProgress: () => progressWithAchievements,
    getStats: () => statsWithAchievements,
    getUserPlants: () => plantsWithAchievements
  })
  assert.equal(grantedCount, 5)
  assert.deepEqual(
    inserted.slice(2).map(item => item.id),
    [
      ACHIEVEMENTS.cinco_plantas.id,
      ACHIEVEMENTS.primer_nivel.id,
      ACHIEVEMENTS.planta_nivel3.id,
      ACHIEVEMENTS.diagnostico_perfecto.id,
      ACHIEVEMENTS.racha_5.id
    ]
  )

  const migrated = []
  migrateLegacyAchievements({
    migrateLegacyAchievement: (name, key) => migrated.push({ name, key })
  }, {
    'Primer Brote': 'primera_planta',
    'Cuidador Novato': 'primer_nivel'
  })
  assert.deepEqual(migrated, [
    { name: 'Primer Brote', key: 'primera_planta' },
    { name: 'Cuidador Novato', key: 'primer_nivel' }
  ])
}

module.exports = {
  validateAchievementService
}
