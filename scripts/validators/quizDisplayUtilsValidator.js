const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateQuizDisplayUtils() {
  const utilsPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'utils', 'quiz-display-utils.js')
  const source = fs.readFileSync(utilsPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: utilsPath })

  const { QuizDisplayUtils } = sandbox.window

  assert.ok(QuizDisplayUtils, 'QuizDisplayUtils debe exponerse en window')
  assert.strictEqual(QuizDisplayUtils.getAnswerFeedbackTitle(true), 'Correcto')
  assert.strictEqual(QuizDisplayUtils.getAnswerFeedbackTitle(false), 'Incorrecto')
  assert.strictEqual(QuizDisplayUtils.getNextButtonLabel(false), 'Siguiente')
  assert.strictEqual(QuizDisplayUtils.getNextButtonLabel(true), 'Ver resultado')
  assert.strictEqual(QuizDisplayUtils.getStreakNoteHTML(false), '')
  assert.ok(QuizDisplayUtils.getStreakNoteHTML(true).includes('result-streak'))
  assert.ok(QuizDisplayUtils.getStreakNoteHTML(true).includes('racha de hoy'))

  const excellent = QuizDisplayUtils.getResultLevel(80)
  assert.strictEqual(excellent.icon, '*')
  assert.strictEqual(excellent.message, 'Excelente dominio de conceptos de cuidado vegetal.')

  const good = QuizDisplayUtils.getResultLevel(60)
  assert.strictEqual(good.icon, '+')
  assert.strictEqual(good.message, 'Buen resultado. Sigue practicando para reforzar decisiones de cuidado.')

  const needsPractice = QuizDisplayUtils.getResultLevel(59)
  assert.strictEqual(needsPractice.icon, '!')
  assert.strictEqual(needsPractice.message, 'Hay conceptos por reforzar. Revisa riego, luz, sustrato y poda.')
}

module.exports = { validateQuizDisplayUtils }
