const { getEligibleAchievements } = require('../domain/achievementRules')

function buildAchievementRecord(achievement, progress) {
  return {
    id: achievement.id,
    nombre: achievement.nombre,
    descripcion: achievement.descripcion,
    fecha: String(progress.nivel),
    tipo: achievement.tipo
  }
}

function grantAchievement({ achievementRepository, achievement, progress, existingIds = null }) {
  const grantedIds = existingIds || achievementRepository.getAchievementIds()
  if (grantedIds.includes(achievement.id)) return false

  achievementRepository.insertAchievement(buildAchievementRecord(achievement, progress))
  return true
}

function getAchievements(achievementRepository) {
  return achievementRepository.getAchievements()
}

function migrateLegacyAchievements(achievementRepository, legacyAchievementKeys) {
  for (const [name, key] of Object.entries(legacyAchievementKeys)) {
    achievementRepository.migrateLegacyAchievement(name, key)
  }
}

function checkAndGrantAchievements({
  achievementRepository,
  getProgress,
  getStats,
  getUserPlants
}) {
  const progress = getProgress()
  const stats = getStats()
  const plants = getUserPlants()
  const existingIds = achievementRepository.getAchievementIds()
  let grantedCount = 0

  for (const achievement of getEligibleAchievements({ progress, stats, plants })) {
    const wasGranted = grantAchievement({
      achievementRepository,
      achievement,
      progress,
      existingIds
    })

    if (wasGranted) grantedCount++
  }

  return grantedCount
}

function grantQuizPerfectAchievement({ achievementRepository, achievement, getProgress }) {
  const existingIds = achievementRepository.getAchievementIds()

  if (existingIds.includes(achievement.id)) return false

  const progress = getProgress()
  return grantAchievement({
    achievementRepository,
    achievement,
    progress,
    existingIds
  })
}

module.exports = {
  buildAchievementRecord,
  checkAndGrantAchievements,
  getAchievements,
  grantAchievement,
  grantQuizPerfectAchievement,
  migrateLegacyAchievements
}
