const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateCareDisplayUtils() {
  const utilsPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'care-display-utils.js')
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = {
    NumberUtils: {
      clamp(value, min, max) {
        return Math.max(min, Math.min(max, value))
      }
    },
    window: {}
  }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { CareDisplayUtils } = sandbox.window

  assert.ok(CareDisplayUtils, 'CareDisplayUtils debe exponerse en window')
  assert.strictEqual(CareDisplayUtils.plantPlaceholderPath, '../assets/sprites/plants/placeholder.png')
  assert.strictEqual(CareDisplayUtils.getPlantStateColor('SANA'), '#66bb6a')
  assert.strictEqual(CareDisplayUtils.getPlantStateColor('MARCHITA'), '#ffa726')
  assert.strictEqual(CareDisplayUtils.getPlantStateColor('ENFERMA'), '#ef5350')
  assert.strictEqual(CareDisplayUtils.getPlantStateColor('MUERTA'), '#757575')
  assert.strictEqual(CareDisplayUtils.getPlantStateColor('DESCONOCIDA'), '#757575')
  assert.strictEqual(
    CareDisplayUtils.getPlantSpritePath('cactus'),
    '../assets/sprites/plants/cactus/sana.png'
  )
  assert.strictEqual(
    CareDisplayUtils.getPlantSpritePath('rosa', 'ENFERMA'),
    '../assets/sprites/plants/rosa/enferma.png'
  )
  assert.strictEqual(
    CareDisplayUtils.getLegacyPlantSpritePath('rosa', 'ENFERMA'),
    '../assets/sprites/plants/rosa_enferma.png'
  )
  const lockedPruneButton = CareDisplayUtils.getPruneButtonState({
    pruneUnlocked: false,
    pruneAvailable: true
  })
  assert.strictEqual(lockedPruneButton.buttonClass, 'btn-ghost')
  assert.strictEqual(lockedPruneButton.disabledAttribute, 'disabled')
  assert.ok(lockedPruneButton.label.includes('Podar'))
  assert.ok(lockedPruneButton.label.includes('nivel 2'))

  const unavailablePruneButton = CareDisplayUtils.getPruneButtonState({
    pruneUnlocked: true,
    pruneAvailable: false
  })
  assert.strictEqual(unavailablePruneButton.buttonClass, 'btn-ghost')
  assert.strictEqual(unavailablePruneButton.disabledAttribute, 'disabled')
  assert.ok(unavailablePruneButton.label.includes('No necesita poda'))

  const availablePruneButton = CareDisplayUtils.getPruneButtonState({
    pruneUnlocked: true,
    pruneAvailable: true
  })
  assert.strictEqual(availablePruneButton.buttonClass, 'btn-secondary')
  assert.strictEqual(availablePruneButton.disabledAttribute, '')
  assert.ok(availablePruneButton.label.includes('Podar'))
  assert.strictEqual(CareDisplayUtils.getHealthState(20), 'CrÃ­tica')
  assert.strictEqual(CareDisplayUtils.getHealthState(50), 'Delicada')
  assert.strictEqual(CareDisplayUtils.getHealthState(75), 'Estable')
  assert.strictEqual(CareDisplayUtils.getHealthState(90), 'Saludable')
  assert.strictEqual(CareDisplayUtils.getHumidityState(39), 'Baja')
  assert.strictEqual(CareDisplayUtils.getHumidityState(75), 'Optima')
  assert.strictEqual(CareDisplayUtils.getHumidityState(90), 'Saturada')
  assert.strictEqual(CareDisplayUtils.getNutrientState(29), 'Bajos')
  assert.strictEqual(CareDisplayUtils.getNutrientState(75), 'Optimos')
  assert.strictEqual(CareDisplayUtils.getNutrientState(90), 'Exceso')

  const meter = CareDisplayUtils.getCareMeterHTML({
    icon: '&hearts;',
    label: 'Salud',
    value: 130,
    state: 'Saludable',
    type: 'health'
  })

  assert.ok(meter.includes('care-meter-health'))
  assert.ok(meter.includes('aria-label="Salud: 100"'))
  assert.ok(meter.includes('left:100%'))
}

module.exports = { validateCareDisplayUtils }
