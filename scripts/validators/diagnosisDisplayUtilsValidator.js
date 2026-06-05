const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateDiagnosisDisplayUtils() {
  const utilsPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'diagnosis-display-utils.js')
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { DiagnosisDisplayUtils } = sandbox.window

  assert.ok(DiagnosisDisplayUtils, 'DiagnosisDisplayUtils debe exponerse en window')
  assert.strictEqual(DiagnosisDisplayUtils.clampMeterValue(-5), 0)
  assert.strictEqual(DiagnosisDisplayUtils.clampMeterValue(42), 42)
  assert.strictEqual(DiagnosisDisplayUtils.clampMeterValue(130), 100)
  assert.strictEqual(DiagnosisDisplayUtils.getHumidityLabel(30), 'Humedad (baja)')
  assert.strictEqual(DiagnosisDisplayUtils.getHumidityLabel(75), 'Humedad (optima)')
  assert.strictEqual(DiagnosisDisplayUtils.getHumidityLabel(90), 'Humedad (saturada)')
  assert.strictEqual(DiagnosisDisplayUtils.getHumidityState(10), 'seca')
  assert.strictEqual(DiagnosisDisplayUtils.getHumidityState(30), 'baja')
  assert.strictEqual(DiagnosisDisplayUtils.getHumidityState(75), 'adecuada')
  assert.strictEqual(DiagnosisDisplayUtils.getHumidityState(90), 'alta')
  assert.strictEqual(DiagnosisDisplayUtils.getHumidityState(95), 'saturada')
  assert.strictEqual(DiagnosisDisplayUtils.getHealthState(25), 'critica')
  assert.strictEqual(DiagnosisDisplayUtils.getHealthState(50), 'delicada')
  assert.strictEqual(DiagnosisDisplayUtils.getHealthState(75), 'estable')
  assert.strictEqual(DiagnosisDisplayUtils.getHealthState(90), 'saludable')

  const meter = DiagnosisDisplayUtils.getHumidityBarHTML(130)
  assert.ok(meter.includes('diag-bar-balanced'))
  assert.ok(meter.includes('left:100%'))
  assert.ok(meter.includes('saturada'))

  const healthMeter = DiagnosisDisplayUtils.getHealthBarHTML(-10)
  assert.ok(healthMeter.includes('diag-bar-health'))
  assert.ok(healthMeter.includes('left:0%'))
  assert.ok(healthMeter.includes('critica'))

  assert.strictEqual(
    DiagnosisDisplayUtils.getResultText({
      answeredCorrectly: true,
      requiresDrain: false
    }),
    'Correcto. Observaste bien las seÃ±ales.'
  )
  assert.strictEqual(
    DiagnosisDisplayUtils.getResultText({
      answeredCorrectly: true,
      requiresDrain: true
    }),
    'Correcto. Aplicaste drenaje antes de regar.'
  )
  assert.strictEqual(
    DiagnosisDisplayUtils.getResultText({
      answeredCorrectly: false,
      requiresDrain: false,
      streakEvent: { changed: true, message: 'Racha reiniciada' }
    }),
    'No era la causa principal. Revisa las seÃ±ales de la planta. Racha reiniciada.'
  )
}

module.exports = { validateDiagnosisDisplayUtils }
