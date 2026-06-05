function correctActionStats() {
  return {
    acciones_correctas: 1,
    acciones_correctas_hoy: 1,
    acciones_totales: 1
  }
}

function errorStats(errorField) {
  return {
    [errorField]: 1,
    acciones_totales: 1
  }
}

function calculateWaterCare(humedad) {
  const newHumedad = Math.min(100, humedad + 20)

  if (humedad >= 76) {
    return {
      status: 'SATURATED',
      newHumedad,
      xpGained: 0,
      isError: true,
      statsUpdates: errorStats('errores_riego')
    }
  }

  if (humedad >= 56) {
    return {
      status: 'PREMATURE',
      newHumedad,
      xpGained: 5,
      isError: true,
      statsUpdates: errorStats('errores_riego')
    }
  }

  if (humedad >= 20) {
    return {
      status: 'CORRECT',
      newHumedad,
      xpGained: 15,
      isError: false,
      statsUpdates: correctActionStats()
    }
  }

  return {
    status: 'URGENT',
    newHumedad,
    xpGained: 15,
    isError: false,
    statsUpdates: correctActionStats()
  }
}

function calculateFertilizeCare(nutrientes) {
  if (nutrientes > 75) {
    return {
      status: 'EXCESS',
      newNutrientes: nutrientes,
      healthChange: -5,
      xpGained: 0,
      isError: true,
      statsUpdates: errorStats('errores_abono')
    }
  }

  if (nutrientes >= 40) {
    return {
      status: 'PREMATURE',
      newNutrientes: Math.min(100, nutrientes + 15),
      healthChange: 0,
      xpGained: 5,
      isError: true,
      statsUpdates: errorStats('errores_abono')
    }
  }

  return {
    status: 'CORRECT',
    newNutrientes: Math.min(100, nutrientes + 25),
    healthChange: 0,
    xpGained: 12,
    isError: false,
    statsUpdates: correctActionStats()
  }
}

function calculateDrainCare(humedad) {
  if (humedad <= 75) {
    return {
      status: 'UNNECESSARY',
      newHumedad: Math.max(0, humedad - 10),
      xpGained: 0,
      isError: true,
      statsUpdates: errorStats('errores_riego')
    }
  }

  return {
    status: 'CORRECT',
    newHumedad: Math.max(40, humedad - 25),
    xpGained: 12,
    isError: false,
    statsUpdates: correctActionStats()
  }
}

function calculatePruneCare({ playerLevel, tipoPoda, requierePodaActiva, salud }) {
  if (playerLevel < 2) {
    return {
      status: 'LOCKED_BY_LEVEL',
      xpGained: 0,
      isError: false,
      statsUpdates: null,
      stateUpdates: null
    }
  }

  if (tipoPoda === 'NUNCA') {
    return {
      status: 'NOT_PRUNABLE',
      xpGained: 0,
      isError: true,
      statsUpdates: errorStats('errores_poda'),
      stateUpdates: null
    }
  }

  if (!requierePodaActiva) {
    return {
      status: 'NOT_NEEDED',
      xpGained: 0,
      isError: true,
      statsUpdates: errorStats('errores_poda'),
      stateUpdates: null
    }
  }

  return {
    status: 'CORRECT',
    xpGained: 20,
    isError: false,
    statsUpdates: correctActionStats(),
    stateUpdates: {
      salud: Math.min(100, salud + 10),
      requiere_poda_activa: 0
    }
  }
}

module.exports = {
  calculateWaterCare,
  calculateFertilizeCare,
  calculateDrainCare,
  calculatePruneCare
}
