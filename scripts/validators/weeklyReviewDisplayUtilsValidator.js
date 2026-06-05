const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateWeeklyReviewDisplayUtils() {
  const utilsPath = path.join(
    __dirname,
    '..',
    '..',
    'renderer',
    'js',
    'utils',
    'weekly-review-display-utils.js'
  )
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { WeeklyReviewDisplayUtils } = sandbox.window

  assert.ok(WeeklyReviewDisplayUtils, 'WeeklyReviewDisplayUtils debe exponerse en window')
  assert.strictEqual(
    WeeklyReviewDisplayUtils.getFrequencyLabel({ errorCount: 1 }, 0),
    'Mas frecuente: 1 vez'
  )
  assert.strictEqual(
    WeeklyReviewDisplayUtils.getFrequencyLabel({ errorCount: 2 }, 1),
    'Frecuente: 2 veces'
  )
  assert.strictEqual(
    WeeklyReviewDisplayUtils.getFrequencyLabel({ errorCount: 3 }, 2),
    'Ocasional: 3 veces'
  )
  assert.strictEqual(WeeklyReviewDisplayUtils.getActionBarWidth(5, 10), 50)
  assert.strictEqual(WeeklyReviewDisplayUtils.getActionBarWidth(12, 10), 100)
  assert.strictEqual(WeeklyReviewDisplayUtils.getActionBarWidth(5, 0), 0)
}

module.exports = { validateWeeklyReviewDisplayUtils }
