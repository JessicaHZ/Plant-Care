const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateDiagnosisScenarioSelector() {
  const selectorPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'diagnosis-scenario-selector.js')
  const source = fs.readFileSync(selectorPath, 'utf8')
  const scenarios = {
    MUERTA: { id: 'MUERTA' },
    ENFERMA_EXCESO: { id: 'ENFERMA_EXCESO' },
    MARCHITA_EXCESO: { id: 'MARCHITA_EXCESO' },
    SANA_EXCESO_AGUA: { id: 'SANA_EXCESO_AGUA' },
    WATER_LUZ_INCORRECTA: { id: 'WATER_LUZ_INCORRECTA' },
    MARCHITA: { id: 'MARCHITA' },
    SANA_NECESITA_AGUA: { id: 'SANA_NECESITA_AGUA' },
    WATER_TIERRA_OPTIMA: { id: 'WATER_TIERRA_OPTIMA' },
    FERTILIZE_NUTRIENTES_EXCESO: { id: 'FERTILIZE_NUTRIENTES_EXCESO' },
    FERTILIZE_NUTRIENTES_BAJOS: { id: 'FERTILIZE_NUTRIENTES_BAJOS' },
    FERTILIZE_NO_CORRIGE_OTRO_PROBLEMA: { id: 'FERTILIZE_NO_CORRIGE_OTRO_PROBLEMA' },
    FERTILIZE_NUTRIENTES_ADECUADOS: { id: 'FERTILIZE_NUTRIENTES_ADECUADOS' },
    PRUNE_NECESARIA: { id: 'PRUNE_NECESARIA' },
    PRUNE_NO_NECESARIA: { id: 'PRUNE_NO_NECESARIA' }
  }
  const sandbox = {
    DiagnosisRules: {
      hasWrongLight(plant) {
        return plant.wrongLight === true
      }
    },
    window: {}
  }

  vm.runInNewContext(source, sandbox, { filename: selectorPath })

  const { DiagnosisScenarioSelector } = sandbox.window

  assert.ok(DiagnosisScenarioSelector, 'DiagnosisScenarioSelector debe exponerse en window')
  assert.strictEqual(
    DiagnosisScenarioSelector.selectScenario({
      scenarios,
      plant: { estado_planta: 'MUERTA', humedad: 50 },
      actionType: 'water'
    }).id,
    'MUERTA'
  )
  assert.strictEqual(
    DiagnosisScenarioSelector.selectScenario({
      scenarios,
      plant: { estado_planta: 'ENFERMA', humedad: 90 },
      actionType: 'water'
    }).id,
    'ENFERMA_EXCESO'
  )
  assert.strictEqual(
    DiagnosisScenarioSelector.selectScenario({
      scenarios,
      plant: { estado_planta: 'MARCHITA', humedad: 50, wrongLight: true },
      actionType: 'water'
    }).id,
    'WATER_LUZ_INCORRECTA'
  )
  assert.strictEqual(
    DiagnosisScenarioSelector.selectScenario({
      scenarios,
      plant: { estado_planta: 'SANA', humedad: 30 },
      actionType: 'unknown'
    }).id,
    'SANA_NECESITA_AGUA'
  )
  assert.strictEqual(
    DiagnosisScenarioSelector.selectScenario({
      scenarios,
      plant: { estado_planta: 'SANA', humedad: 50, nutrientes: 20 },
      actionType: 'fertilize'
    }).id,
    'FERTILIZE_NUTRIENTES_BAJOS'
  )
  assert.strictEqual(
    DiagnosisScenarioSelector.selectScenario({
      scenarios,
      plant: { estado_planta: 'SANA', requiere_poda_activa: 1 },
      actionType: 'prune'
    }).id,
    'PRUNE_NECESARIA'
  )
}

module.exports = { validateDiagnosisScenarioSelector }
