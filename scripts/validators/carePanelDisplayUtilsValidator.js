const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateCarePanelDisplayUtils() {
  const utilsPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'care-panel-display-utils.js')
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = {
    CareDisplayUtils: {
      plantPlaceholderPath: '../assets/sprites/plants/placeholder.png',
      getPlantSpritePath(spriteKey, plantState = 'SANA') {
        return `../assets/sprites/plants/${spriteKey}/${plantState.toLowerCase()}.png`
      },
      getPruneButtonState({ pruneUnlocked, pruneAvailable }) {
        if (!pruneUnlocked || !pruneAvailable) {
          return {
            buttonClass: 'btn-ghost',
            disabledAttribute: 'disabled',
            label: 'Podar bloqueado'
          }
        }

        return {
          buttonClass: 'btn-secondary',
          disabledAttribute: '',
          label: 'Podar'
        }
      },
      getCareMeterHTML({ label, value, state, type }) {
        return `<div class="care-meter-${type}" data-label="${label}" data-value="${value}">${state}</div>`
      },
      getHumidityState(value) {
        return value < 40 ? 'Baja' : 'Optima'
      },
      getHealthState(value) {
        return value < 50 ? 'Delicada' : 'Saludable'
      },
      getNutrientState(value) {
        return value < 30 ? 'Bajos' : 'Optimos'
      }
    },
    window: {}
  }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { CarePanelDisplayUtils } = sandbox.window
  assert.ok(CarePanelDisplayUtils, 'CarePanelDisplayUtils debe exponerse en window')

  const livingPanel = CarePanelDisplayUtils.getCarePanelHTML({
    plant: {
      nombre_planta: 'Helecho',
      sprite_key: 'helecho',
      estado_planta: 'SANA',
      humedad: 45,
      salud: 90,
      nutrientes: 25,
      tipo_poda: 'LIGERA',
      requiere_poda_activa: 1,
      ubicacion: 'sala'
    },
    playerLevel: 2,
    pruneUnlocked: true
  })

  assert.ok(livingPanel.includes('care-panel-header'))
  assert.ok(livingPanel.includes('Helecho'))
  assert.ok(livingPanel.includes('btn-water'))
  assert.ok(livingPanel.includes('btn-fertilize'))
  assert.ok(livingPanel.includes('btn-prune'))
  assert.ok(livingPanel.includes('btn-move-plant'))
  assert.ok(livingPanel.includes('care-meter-health'))
  assert.ok(livingPanel.includes('Bajos'))

  const deadPanel = CarePanelDisplayUtils.getDeadPlantPanelHTML({
    nombre_planta: 'Cactus',
    sprite_key: 'cactus'
  })

  assert.ok(deadPanel.includes('Planta muerta'))
  assert.ok(deadPanel.includes('btn-delete-plant'))
  assert.ok(deadPanel.includes('cactus/muerta.png'))
}

module.exports = { validateCarePanelDisplayUtils }
