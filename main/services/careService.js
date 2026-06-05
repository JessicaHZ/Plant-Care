const {
  calculateDrainCare,
  calculateFertilizeCare,
  calculatePruneCare,
  calculateWaterCare
} = require('../domain/careRules')
const { clamp } = require('../utils/number-utils')

function buildWaterFeedback(plant, careResult) {
  if (careResult.status === 'SATURATED') {
    return `Tu ${plant.nombre_planta} ya tenía la tierra saturada. ` +
      'El exceso de agua impide que las raíces respiren.'
  }

  if (careResult.status === 'PREMATURE') {
    const detail = careResult.newHumedad > 75
      ? 'Ahora quedó demasiado mojada; observa antes de volver a regar.'
      : 'Conviene esperar señales de sequedad antes de regar otra vez.'

    return `La tierra de tu ${plant.nombre_planta} aún estaba húmeda. ${detail}`
  }

  if (careResult.status === 'CORRECT') {
    return 'La tierra estaba seca. ' +
      `Tu ${plant.nombre_planta} respondió bien al riego.`
  }

  return 'La tierra estaba muy seca. ' +
    'Riega con cuidado y observa si las hojas se recuperan.'
}

function buildDrainFeedback(plant, careResult) {
  if (careResult.status === 'UNNECESSARY') {
    return `La tierra de tu ${plant.nombre_planta} no estaba saturada. ` +
      'Drenar sin necesidad puede secar demasiado el sustrato.'
  }

  return 'La tierra estaba saturada. ' +
    'Drenar ayudó a sacar el exceso de agua y proteger las raíces.'
}

function buildFertilizeFeedback(plant, careResult) {
  if (careResult.status === 'EXCESS') {
    return `Tu ${plant.nombre_planta} ya tenía suficiente alimento en el sustrato. ` +
      'Demasiado abono puede quemar las raíces.'
  }

  if (careResult.status === 'PREMATURE') {
    return `El sustrato de tu ${plant.nombre_planta} aún tenía nutrientes. ` +
      'El abono ayuda más cuando la planta muestra desgaste.'
  }

  return 'El sustrato estaba pobre en nutrientes. ' +
    `El abono ayudará a tu ${plant.nombre_planta} a recuperarse poco a poco.`
}

function buildPruneFeedback(plant, careResult) {
  if (careResult.status === 'NOT_PRUNABLE') {
    return `El ${plant.nombre_planta} no requiere poda. Cortarlo sin necesidad puede debilitarlo.`
  }

  if (careResult.status === 'NOT_NEEDED') {
    return `Tu ${plant.nombre_planta} no necesita poda ahora. ` +
      'Espera a ver hojas secas o crecimiento desordenado.'
  }

  return `Poda realizada con cuidado. ` +
    `Tu ${plant.nombre_planta} puede concentrar energía en brotes sanos.`
}

function drainPlant({
  idRegistro,
  plantRepository,
  updateStats,
  updatePlantState,
  addExperience,
  recordResponsibleCareSession,
  checkAndGrantAchievements
}) {
  const plant = plantRepository.getUserPlantForCare(idRegistro)

  if (!plant) return { success: false, error: 'Planta no encontrada' }
  if (plant.estado_planta === 'MUERTA') {
    return { success: false, error: 'No puedes drenar una planta muerta' }
  }

  const careResult = calculateDrainCare(plant.humedad)

  updateStats(careResult.statsUpdates)
  updatePlantState(idRegistro, { humedad: careResult.newHumedad })
  const xpResult = addExperience(careResult.xpGained)
  const streakEvent = careResult.isError ? null : recordResponsibleCareSession()
  checkAndGrantAchievements()

  return {
    success: true,
    feedback: buildDrainFeedback(plant, careResult),
    xpGained: careResult.xpGained,
    isError: careResult.isError,
    xpResult,
    streakEvent
  }
}

function prunePlant({
  idRegistro,
  plantRepository,
  getProgress,
  updateStats,
  updatePlantState,
  addExperience,
  recordResponsibleCareSession,
  checkAndGrantAchievements
}) {
  const progress = getProgress()

  if (calculatePruneCare({
    playerLevel: progress.nivel,
    tipoPoda: null,
    requierePodaActiva: false,
    salud: 0
  }).status === 'LOCKED_BY_LEVEL') {
    return {
      success: false,
      feedback: '🔒 La herramienta de poda se desbloquea al alcanzar el nivel 2.',
      xpGained: 0,
      isError: false
    }
  }

  const plant = plantRepository.getUserPlantForCare(idRegistro)
  if (!plant) return { success: false, error: 'Planta no encontrada' }

  const careResult = calculatePruneCare({
    playerLevel: progress.nivel,
    tipoPoda: plant.tipo_poda,
    requierePodaActiva: plant.requiere_poda_activa,
    salud: plant.salud
  })

  if (careResult.status === 'NOT_PRUNABLE' || careResult.status === 'NOT_NEEDED') {
    updateStats(careResult.statsUpdates)
    return {
      success: true,
      feedback: buildPruneFeedback(plant, careResult),
      xpGained: careResult.xpGained,
      isError: careResult.isError
    }
  }

  updatePlantState(idRegistro, {
    ...careResult.stateUpdates,
    ultimo_poda: plant.dias_transcurridos
  })
  updateStats(careResult.statsUpdates)
  const xpResult = addExperience(careResult.xpGained)
  const streakEvent = recordResponsibleCareSession()
  checkAndGrantAchievements()

  return {
    success: true,
    feedback: buildPruneFeedback(plant, careResult),
    xpGained: careResult.xpGained,
    isError: careResult.isError,
    xpResult,
    streakEvent
  }
}

function fertilizePlant({
  idRegistro,
  plantRepository,
  updateStats,
  updatePlantState,
  addExperience,
  recordResponsibleCareSession,
  checkAndGrantAchievements
}) {
  const plant = plantRepository.getUserPlantForCare(idRegistro)

  if (!plant || plant.estado_planta === 'MUERTA') {
    return { success: false, error: 'No se puede abonar esta planta' }
  }

  const careResult = calculateFertilizeCare(plant.nutrientes ?? 50)
  const newSalud = clamp(plant.salud + careResult.healthChange, 0, 100)

  updateStats(careResult.statsUpdates)
  updatePlantState(idRegistro, {
    salud: newSalud,
    nutrientes: careResult.newNutrientes
  })

  const xpResult = addExperience(careResult.xpGained)
  const streakEvent = careResult.isError ? null : recordResponsibleCareSession()
  checkAndGrantAchievements()

  return {
    success: true,
    feedback: buildFertilizeFeedback(plant, careResult),
    xpGained: careResult.xpGained,
    isError: careResult.isError,
    xpResult,
    streakEvent
  }
}

function waterPlant({
  idRegistro,
  plantRepository,
  updateStats,
  updatePlantState,
  addExperience,
  recordResponsibleCareSession,
  checkAndGrantAchievements
}) {
  const plant = plantRepository.getUserPlantForCare(idRegistro)

  if (!plant) return { success: false, error: 'Planta no encontrada' }
  if (plant.estado_planta === 'MUERTA') {
    return { success: false, error: 'No puedes regar una planta muerta' }
  }

  const careResult = calculateWaterCare(plant.humedad)

  updateStats(careResult.statsUpdates)
  updatePlantState(idRegistro, {
    humedad: careResult.newHumedad,
    ultimo_riego: plant.dias_transcurridos,
    dias_sin_regar: 0
  })

  const xpResult = addExperience(careResult.xpGained)
  const streakEvent = careResult.isError ? null : recordResponsibleCareSession()
  checkAndGrantAchievements()

  return {
    success: true,
    feedback: buildWaterFeedback(plant, careResult),
    xpGained: careResult.xpGained,
    isError: careResult.isError,
    xpResult,
    streakEvent
  }
}

module.exports = {
  drainPlant,
  fertilizePlant,
  prunePlant,
  waterPlant
}
