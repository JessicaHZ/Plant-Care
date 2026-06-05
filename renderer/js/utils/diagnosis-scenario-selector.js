const DiagnosisScenarioSelector = {
  selectScenario({ scenarios, plant, actionType }) {
    if (plant.estado_planta === 'MUERTA') return scenarios.MUERTA

    if (actionType === 'water') return this.selectWaterScenario(scenarios, plant)
    if (actionType === 'fertilize') return this.selectFertilizeScenario(scenarios, plant)
    if (actionType === 'prune') return this.selectPruneScenario(scenarios, plant)

    return this.selectWaterScenario(scenarios, plant)
  },

  selectWaterScenario(scenarios, plant) {
    const { estado_planta, humedad } = plant

    if (humedad > 75) {
      if (estado_planta === 'ENFERMA') return scenarios.ENFERMA_EXCESO
      if (estado_planta === 'MARCHITA') return scenarios.MARCHITA_EXCESO
      return scenarios.SANA_EXCESO_AGUA
    }

    if (DiagnosisRules.hasWrongLight(plant) && estado_planta !== 'SANA') {
      return scenarios.WATER_LUZ_INCORRECTA
    }

    if (humedad < 40) {
      if (estado_planta === 'MARCHITA' || estado_planta === 'ENFERMA') {
        return scenarios.MARCHITA
      }
      return scenarios.SANA_NECESITA_AGUA
    }

    return scenarios.WATER_TIERRA_OPTIMA
  },

  selectFertilizeScenario(scenarios, plant) {
    const nutrientes = plant.nutrientes ?? 50

    if (nutrientes > 75) return scenarios.FERTILIZE_NUTRIENTES_EXCESO
    if (nutrientes < 30) return scenarios.FERTILIZE_NUTRIENTES_BAJOS

    if (plant.estado_planta === 'ENFERMA' ||
        plant.estado_planta === 'MARCHITA' ||
        DiagnosisRules.hasWrongLight(plant)) {
      return scenarios.FERTILIZE_NO_CORRIGE_OTRO_PROBLEMA
    }

    return scenarios.FERTILIZE_NUTRIENTES_ADECUADOS
  },

  selectPruneScenario(scenarios, plant) {
    return plant.requiere_poda_activa === 1
      ? scenarios.PRUNE_NECESARIA
      : scenarios.PRUNE_NO_NECESARIA
  }
}

window.DiagnosisScenarioSelector = DiagnosisScenarioSelector
