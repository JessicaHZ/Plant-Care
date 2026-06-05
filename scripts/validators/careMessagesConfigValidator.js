const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateCareMessagesConfig() {
  const configPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'config', 'careMessagesConfig.js')
  const source = fs.readFileSync(configPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: configPath })

  const { CareMessagesConfig } = sandbox.window
  const expectedTypes = ['riego', 'abono', 'poda', 'ubicacion']

  assert.ok(CareMessagesConfig, 'CareMessagesConfig debe exponerse en window')
  assert.strictEqual(Object.keys(CareMessagesConfig.contextualGuides).sort().join(','), expectedTypes.sort().join(','))
  assert.strictEqual(Object.keys(CareMessagesConfig.guideHints).sort().join(','), expectedTypes.sort().join(','))

  expectedTypes.forEach(type => {
    const guide = CareMessagesConfig.contextualGuides[type]
    const hint = CareMessagesConfig.guideHints[type]

    assert.ok(guide.icon, `La guia ${type} debe tener icon`)
    assert.ok(guide.title, `La guia ${type} debe tener title`)
    assert.ok(Array.isArray(guide.steps), `La guia ${type} debe tener steps`)
    assert.ok(guide.steps.length >= 3, `La guia ${type} debe tener al menos 3 pasos`)
    assert.ok(hint.mood, `El hint ${type} debe tener mood`)
    assert.ok(hint.message, `El hint ${type} debe tener message`)
  })
}

module.exports = { validateCareMessagesConfig }
