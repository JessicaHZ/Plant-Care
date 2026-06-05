const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateEnvironmentDisplayUtils() {
  const utilsPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'environment-display-utils.js')
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { EnvironmentDisplayUtils } = sandbox.window

  assert.ok(EnvironmentDisplayUtils, 'EnvironmentDisplayUtils debe exponerse en window')
  assert.strictEqual(
    EnvironmentDisplayUtils.getLightConditionMessage('DIRECTA'),
    'recibe luz solar directa &mdash; ideal para plantas que necesitan sol intenso.'
  )
  assert.strictEqual(
    EnvironmentDisplayUtils.getLightConditionMessage('INDIRECTA'),
    'recibe luz indirecta &mdash; ideal para la mayoria de plantas de interior.'
  )
  assert.strictEqual(
    EnvironmentDisplayUtils.getLightConditionMessage('SOMBRA'),
    'recibe poca luz &mdash; solo para plantas que toleran la sombra.'
  )
  assert.strictEqual(
    EnvironmentDisplayUtils.getLightConditionMessage('DESCONOCIDA'),
    'recibe poca luz &mdash; solo para plantas que toleran la sombra.'
  )

  const questionHTML = EnvironmentDisplayUtils.getLocationQuestionHTML(
    'Cactus',
    { label: 'Jardin', luz: 'DIRECTA' }
  )
  assert.ok(questionHTML.includes('&iquest;Buena ubicacion?'))
  assert.ok(questionHTML.includes('data-answer="yes"'))
  assert.ok(questionHTML.includes('data-answer="no"'))
  assert.ok(questionHTML.includes('data-answer="dunno"'))

  const resultHTML = EnvironmentDisplayUtils.getLocationResultHTML({
    plantName: 'Cactus',
    room: { label: 'Jardin' },
    actualLight: 'DIRECTA'
  })
  assert.ok(resultHTML.includes('Resultado real'))
  assert.ok(resultHTML.includes('Cactus'))
  assert.ok(resultHTML.includes('btn-close-location-result'))
}

module.exports = { validateEnvironmentDisplayUtils }
