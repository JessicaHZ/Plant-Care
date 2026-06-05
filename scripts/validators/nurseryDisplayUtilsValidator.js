const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateNurseryDisplayUtils() {
  const utilsPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'nursery-display-utils.js')
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { NurseryDisplayUtils } = sandbox.window

  assert.ok(NurseryDisplayUtils, 'NurseryDisplayUtils debe exponerse en window')
  assert.strictEqual(NurseryDisplayUtils.getDifficultyColor('FACIL'), '#66bb6a')
  assert.strictEqual(NurseryDisplayUtils.getDifficultyColor('MEDIO'), '#ffa726')
  assert.strictEqual(NurseryDisplayUtils.getDifficultyColor('DIFICIL'), '#ef5350')
  assert.strictEqual(NurseryDisplayUtils.getDifficultyColor('DESCONOCIDA'), '#fff')
  assert.strictEqual(NurseryDisplayUtils.getLightIcon('DIRECTA'), '\u2600\ufe0f')
  assert.strictEqual(NurseryDisplayUtils.getLightIcon('SIN_DATO'), '\ud83d\udca1')
  const ornamentalType = NurseryDisplayUtils.getPlantTypeConfig('ORNAMENTAL')
  assert.strictEqual(ornamentalType.icon, '\ud83c\udf38')
  assert.strictEqual(ornamentalType.color, '#ce93d8')

  const fallbackType = NurseryDisplayUtils.getPlantTypeConfig('SIN_DATO')
  assert.strictEqual(fallbackType.icon, '\ud83c\udf31')
  assert.strictEqual(fallbackType.color, '#b0bec5')
  assert.strictEqual(NurseryDisplayUtils.getPruningLabel('NUNCA'), 'No requiere poda')
  assert.strictEqual(NurseryDisplayUtils.getPruningLabel('SIN_DATO'), 'Poda no definida')
}

module.exports = { validateNurseryDisplayUtils }
