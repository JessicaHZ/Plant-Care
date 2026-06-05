function calculateDailyHumidity(humedad, diasSinRegar, frecuenciaRiego) {
  if (diasSinRegar <= frecuenciaRiego) return humedad

  const overdueDays = diasSinRegar - frecuenciaRiego
  return Math.max(0, humedad - (overdueDays * 5))
}

function calculateDailyNutrients(nutrientes) {
  return Math.max(0, nutrientes - 1)
}

function calculateHealthAfterEnvironment({ salud, humedad, nutrientes, locationHealthDelta = 0 }) {
  let nextSalud = salud

  if (humedad < 20) nextSalud = Math.max(0, nextSalud - 3)
  else if (humedad < 40) nextSalud = Math.max(0, nextSalud - 2)
  else if (humedad <= 75) {
    if (nutrientes > 75) {
      nextSalud = Math.max(0, nextSalud - 1)
    } else if (nutrientes >= 30) {
      const recovery = nextSalud <= 50 ? 4 : 2
      nextSalud = Math.min(100, nextSalud + recovery)
    } else {
      const recovery = nextSalud <= 50 ? 2 : 1
      nextSalud = Math.min(100, nextSalud + recovery)
    }
  }
  else if (humedad <= 90) nextSalud = Math.max(0, nextSalud - 2)
  else nextSalud = Math.max(0, nextSalud - 3)

  if (locationHealthDelta < 0) {
    nextSalud = Math.max(0, nextSalud + locationHealthDelta)
  }

  return nextSalud
}

function determinePlantState(salud) {
  if (salud <= 0) return 'MUERTA'
  if (salud <= 25) return 'ENFERMA'
  if (salud <= 50) return 'MARCHITA'
  return 'SANA'
}

function shouldActivatePruning({
  pruningInterval,
  requierePodaActiva,
  diasTranscurridos,
  ultimoPoda = 0
}) {
  return pruningInterval !== null &&
    requierePodaActiva !== 1 &&
    diasTranscurridos - ultimoPoda >= pruningInterval
}

module.exports = {
  calculateDailyHumidity,
  calculateDailyNutrients,
  calculateHealthAfterEnvironment,
  determinePlantState,
  shouldActivatePruning
}
