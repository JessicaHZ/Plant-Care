const achievementRepository = require('../database/repositories/achievementRepository')
const plantRepository = require('../database/repositories/plantRepository')
const progressRepository = require('../database/repositories/progressRepository')
const statsRepository = require('../database/repositories/statsRepository')
const {
  checkAndGrantAchievements: checkAndGrantAchievementsFromService
} = require('../services/achievementService')
const progressService = require('../services/progressService')
const statsService = require('../services/statsService')

function getProgress() {
  return progressService.getProgress(progressRepository)
}

function updateProgress(fields) {
  progressService.updateProgress(progressRepository, fields)
}

function getStats() {
  return statsService.getStats(statsRepository)
}

function updateStats(updates) {
  statsService.updateStats(statsRepository, updates)
}

function getUserPlants() {
  return plantRepository.getUserPlants()
}

function addExperience(xpAmount) {
  return progressService.addExperience(progressRepository, xpAmount)
}

function checkAndGrantAchievements() {
  return checkAndGrantAchievementsFromService({
    achievementRepository,
    getProgress,
    getStats,
    getUserPlants
  })
}

module.exports = {
  addExperience,
  checkAndGrantAchievements,
  getProgress,
  getStats,
  getUserPlants,
  updateProgress,
  updateStats
}
