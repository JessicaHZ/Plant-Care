const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateWeeklyReviewRecommendations() {
  const configPath = path.join(
    __dirname,
    '..',
    '..',
    'renderer',
    'js',
    'config',
    'weeklyReviewRecommendations.js'
  )
  const source = fs.readFileSync(configPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: configPath })

  const { WeeklyReviewRecommendations } = sandbox.window
  const expectedKeys = ['riego', 'abono', 'poda', 'ubicacion']

  assert.ok(WeeklyReviewRecommendations, 'WeeklyReviewRecommendations debe exponerse en window')
  assert.deepStrictEqual(Object.keys(WeeklyReviewRecommendations.messages).sort(), expectedKeys.sort())
  expectedKeys.forEach(key => {
    assert.ok(WeeklyReviewRecommendations.messages[key], `Falta recomendacion para ${key}`)
  })
}

module.exports = { validateWeeklyReviewRecommendations }
