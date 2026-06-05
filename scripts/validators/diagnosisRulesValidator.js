const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateDiagnosisRules() {
  const rulesPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'diagnosis-rules.js')
  const source = fs.readFileSync(rulesPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: rulesPath })

  const { DiagnosisRules } = sandbox.window

  assert.ok(DiagnosisRules, 'DiagnosisRules debe exponerse en window')
  assert.strictEqual(DiagnosisRules.getRoomLightCondition('SALA'), 'INDIRECTA')
  assert.strictEqual(DiagnosisRules.getRoomLightCondition('JARDIN'), 'DIRECTA')
  assert.strictEqual(DiagnosisRules.getRoomLightCondition('JARD\u00cdN'), 'DIRECTA')
  assert.strictEqual(DiagnosisRules.getRoomLightCondition('SIN_DATO'), null)
  assert.strictEqual(DiagnosisRules.isLightCompatible('DIRECTA', 'DIRECTA'), true)
  assert.strictEqual(DiagnosisRules.isLightCompatible('SOMBRA', 'INDIRECTA'), true)
  assert.strictEqual(DiagnosisRules.isLightCompatible('DIRECTA', 'INDIRECTA'), false)
  assert.strictEqual(
    DiagnosisRules.hasWrongLight({ ubicacion: 'SALA', tipo_luz: 'DIRECTA' }),
    true
  )
  assert.strictEqual(
    DiagnosisRules.hasWrongLight({ ubicacion: 'SALA', tipo_luz: 'SOMBRA' }),
    false
  )

  sandbox.window.RoomConfig = {
    rooms: {
      LAB: { luz: 'DIRECTA' }
    }
  }

  assert.strictEqual(DiagnosisRules.getRoomLightCondition('LAB'), 'DIRECTA')
  assert.strictEqual(
    DiagnosisRules.shouldShowDiagnosis({
      plant: { estado_planta: 'SANA', nutrientes: 50 },
      level: 2,
      randomValue: 0.99
    }),
    true
  )
  assert.strictEqual(
    DiagnosisRules.shouldShowDiagnosis({
      plant: { estado_planta: 'SANA', nutrientes: 50 },
      level: 4,
      randomValue: 0.32
    }),
    true
  )
  assert.strictEqual(
    DiagnosisRules.shouldShowDiagnosis({
      plant: { estado_planta: 'SANA', nutrientes: 50 },
      level: 4,
      randomValue: 0.33
    }),
    false
  )
  assert.strictEqual(
    DiagnosisRules.shouldShowDiagnosis({
      plant: { estado_planta: 'ENFERMA', nutrientes: 50 },
      level: 5,
      randomValue: 0.99
    }),
    true
  )
  assert.strictEqual(
    DiagnosisRules.shouldShowDiagnosis({
      plant: { estado_planta: 'SANA', nutrientes: 20 },
      level: 5,
      randomValue: 0.99
    }),
    true
  )
  assert.strictEqual(
    DiagnosisRules.shouldShowDiagnosis({
      plant: { estado_planta: 'SANA', nutrientes: 50 },
      level: 5,
      randomValue: 0
    }),
    false
  )
}

module.exports = { validateDiagnosisRules }
