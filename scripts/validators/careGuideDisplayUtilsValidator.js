const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateCareGuideDisplayUtils() {
  const utilsPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'care-guide-display-utils.js')
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { CareGuideDisplayUtils } = sandbox.window
  const html = CareGuideDisplayUtils.getContextualGuideHTML({
    icon: '*',
    title: 'Sobre el riego',
    steps: ['Paso uno', 'Paso dos', 'Paso tres']
  })

  assert.ok(CareGuideDisplayUtils, 'CareGuideDisplayUtils debe exponerse en window')
  assert.ok(html.includes('contextual-guide-modal'))
  assert.ok(html.includes('Sobre el riego'))
  assert.ok(html.includes('Paso uno'))
  assert.ok(html.includes('guide-step-num">3'))
  assert.ok(html.includes('btn-close-guide'))
}

module.exports = { validateCareGuideDisplayUtils }
