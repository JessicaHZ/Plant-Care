const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateQuizQuestionBank() {
  const bankPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'config', 'quizQuestionBank.js')
  const source = fs.readFileSync(bankPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: bankPath })

  const { QuizQuestionBank } = sandbox.window

  assert.ok(QuizQuestionBank, 'QuizQuestionBank debe exponerse en window')
  assert.ok(Array.isArray(QuizQuestionBank.questions), 'questions debe ser un arreglo')
  assert.ok(QuizQuestionBank.questions.length >= 20, 'El banco debe conservar al menos 20 preguntas')

  QuizQuestionBank.questions.forEach((question, index) => {
    assert.ok(question.category, `Pregunta ${index + 1}: falta category`)
    assert.ok(question.question, `Pregunta ${index + 1}: falta question`)
    assert.ok(Array.isArray(question.options), `Pregunta ${index + 1}: options debe ser arreglo`)
    assert.strictEqual(question.options.length, 4, `Pregunta ${index + 1}: debe tener 4 opciones`)
    assert.ok(Number.isInteger(question.correctIndex), `Pregunta ${index + 1}: correctIndex debe ser entero`)
    assert.ok(question.correctIndex >= 0 && question.correctIndex < question.options.length,
      `Pregunta ${index + 1}: correctIndex fuera de rango`)
    assert.ok(question.explanation, `Pregunta ${index + 1}: falta explanation`)
  })
}

module.exports = { validateQuizQuestionBank }
