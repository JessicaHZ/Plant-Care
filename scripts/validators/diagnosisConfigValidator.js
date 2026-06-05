const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateDiagnosisConfig() {
  const configPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'config', 'diagnosisConfig.js')
  const source = fs.readFileSync(configPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: configPath })

  const { DiagnosisConfig } = sandbox.window

  assert.ok(DiagnosisConfig, 'DiagnosisConfig debe exponerse en window')
  assert.strictEqual(DiagnosisConfig.getActionLabel('water'), 'Regar')
  assert.strictEqual(DiagnosisConfig.getActionLabel('fertilize'), 'Abonar')
  assert.strictEqual(DiagnosisConfig.getActionLabel('prune'), 'Podar')
  assert.strictEqual(DiagnosisConfig.getActionLabel('drain'), 'Drenar')
  assert.strictEqual(DiagnosisConfig.getActionLabel('unknown'), 'actuar')

  const scenarioKeys = Object.keys(DiagnosisConfig.scenarios)
  assert.strictEqual(scenarioKeys.length, 16)
  assert.ok(DiagnosisConfig.scenarios.WATER_LUZ_INCORRECTA)
  assert.ok(DiagnosisConfig.scenarios.FERTILIZE_NUTRIENTES_BAJOS)
  assert.ok(DiagnosisConfig.scenarios.PRUNE_NECESARIA)
  assert.ok(DiagnosisConfig.scenarios.MUERTA)

  scenarioKeys.forEach(key => {
    const scenario = DiagnosisConfig.scenarios[key]

    assert.ok(scenario.question, `El escenario ${key} debe tener question`)
    assert.ok(scenario.situation, `El escenario ${key} debe tener situation`)
    assert.ok(Array.isArray(scenario.options), `El escenario ${key} debe tener options`)
    assert.strictEqual(scenario.options.length, 3, `El escenario ${key} debe tener 3 opciones`)
    assert.strictEqual(typeof scenario.correctIndex, 'number', `El escenario ${key} debe tener correctIndex`)
    assert.ok(scenario.explanation, `El escenario ${key} debe tener explanation`)
  })
}

module.exports = { validateDiagnosisConfig }
