// MiniGameQuiz: quiz de 5 preguntas sobre cuidado de plantas.
// Implementa LM1 + LM2: recordar y comprender.
// Una respuesta correcta cuenta para la racha diaria (RF-22).

const MiniGameQuiz = {
  SESSION_LENGTH: 5,

  _onFinish: null,
  _questions: [],
  _current: 0,
  _correct: 0,
  _overlay: null,

  _questionBank: QuizQuestionBank.questions,

  start(onFinish) {
    this._overlay?.remove()
    this._onFinish = onFinish
    this._current = 0
    this._correct = 0
    this._questions = this._buildSession()

    this._createOverlay()
    this._renderQuestion()
  },

  _buildSession() {
    return this._shuffle([...this._questionBank]).slice(0, this.SESSION_LENGTH)
  },

  _createOverlay() {
    const overlay = document.createElement('div')
    overlay.id = 'quiz-overlay'
    overlay.className = 'minigame-overlay'
    overlay.innerHTML = `
      <div class="minigame-container">
        <div class="minigame-header">
          <div>
            <h2 class="minigame-title">Quiz de Plantas</h2>
            <p class="minigame-instruction">
              Responde correctamente para ganar XP y mantener tu racha.
            </p>
          </div>
          <div class="minigame-stats">
            <div class="mini-stat">
              <span class="mini-stat-label">Pregunta</span>
              <span class="mini-stat-value" id="quiz-progress">1/${this.SESSION_LENGTH}</span>
            </div>
            <div class="mini-stat">
              <span class="mini-stat-label">Correctas</span>
              <span class="mini-stat-value" id="quiz-correct">0</span>
            </div>
          </div>
        </div>

        <div id="quiz-question-area"></div>
        <div id="quiz-feedback" class="quiz-feedback hidden"></div>
      </div>
    `

    document.body.appendChild(overlay)
    this._overlay = overlay
    overlay.addEventListener('click', (event) => this._handleClick(event))
  },

  async _handleClick(event) {
    const optionButton = event.target.closest('.quiz-option-btn')
    if (optionButton && !optionButton.disabled) {
      await this._handleAnswer(optionButton)
      return
    }

    if (event.target.id === 'btn-next-question') {
      this._current++
      this._renderQuestion()
      return
    }

    if (event.target.id === 'btn-quiz-done') {
      this._overlay.remove()
      if (this._onFinish) this._onFinish(this._correct)
    }
  },

  _renderQuestion() {
    if (this._current >= this._questions.length) {
      this._showFinalResult()
      return
    }

    const question = this._questions[this._current]
    const area = this._overlay.querySelector('#quiz-question-area')
    const feedback = this._overlay.querySelector('#quiz-feedback')

    feedback.classList.add('hidden')
    feedback.innerHTML = ''

    this._overlay.querySelector('#quiz-progress').textContent =
      `${this._current + 1}/${this._questions.length}`

    area.innerHTML = `
      <div class="quiz-question-card">
        <div class="quiz-category">${question.category}</div>
        <p class="quiz-question-text">${question.question}</p>
        <div class="quiz-options">
          ${question.options.map((option, index) => `
            <button class="quiz-option-btn" data-index="${index}">
              <span class="quiz-opt-letter">${'ABCD'[index]}</span>
              ${option}
            </button>
          `).join('')}
        </div>
      </div>
    `
  },

  async _handleAnswer(button) {
    const question = this._questions[this._current]
    const selected = Number(button.dataset.index)
    const isCorrect = selected === question.correctIndex

    this._overlay.querySelectorAll('.quiz-option-btn').forEach((item) => {
      item.disabled = true
      if (Number(item.dataset.index) === question.correctIndex) {
        item.classList.add('correct')
      }
    })

    if (!isCorrect) button.classList.add('incorrect')
    if (isCorrect) this._correct++

    this._overlay.querySelector('#quiz-correct').textContent = this._correct

    const result = await this._submitAnswer(isCorrect)
    if (result?.xpResult) {
      window.dispatchEvent(new CustomEvent('xp:gained', {
        detail: result.xpResult
      }))
    }

    this._showFeedback(question, isCorrect)
  },

  async _submitAnswer(isCorrect) {
    try {
      return await window.gameAPI.submitQuiz(isCorrect)
    } catch (error) {
      console.error('No se pudo registrar la respuesta del quiz:', error)
      return { success: false, xpResult: null }
    }
  },

  _showFeedback(question, isCorrect) {
    const feedback = this._overlay.querySelector('#quiz-feedback')
    const isLastQuestion = this._current + 1 >= this._questions.length

    feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`
    feedback.innerHTML = `
      <p><strong>${QuizDisplayUtils.getAnswerFeedbackTitle(isCorrect)}</strong></p>
      <p>${question.explanation}</p>
      <button class="btn btn-primary" id="btn-next-question">
        ${QuizDisplayUtils.getNextButtonLabel(isLastQuestion)}
      </button>
    `
    feedback.classList.remove('hidden')
  },

  _showFinalResult() {
    if (this._correct === this._questions.length) {
      window.gameAPI.grantQuizPerfectAchievement()
    }

    const percentage = Math.round((this._correct / this._questions.length) * 100)
    const level = QuizDisplayUtils.getResultLevel(percentage)
    const streakNote = QuizDisplayUtils.getStreakNoteHTML(this._correct > 0)

    this._overlay.querySelector('.minigame-container').innerHTML = `
      <div class="minigame-result quiz-result">
        <div class="result-icon">${level.icon}</div>
        <h2 class="result-title">Resultado del Quiz</h2>
        <div class="result-score-big">
          ${this._correct}<span>/${this._questions.length}</span>
        </div>
        <p class="result-message">${level.message}</p>
        <div class="quiz-result-breakdown">
          <span>Precision</span><strong>${percentage}%</strong>
          <span>Banco disponible</span><strong>${this._questionBank.length} preguntas</strong>
        </div>
        ${streakNote}
        <button class="btn btn-primary" id="btn-quiz-done">Continuar</button>
      </div>
    `
  },

  _shuffle(items) {
    for (let index = items.length - 1; index > 0; index--) {
      const target = Math.floor(Math.random() * (index + 1))
      ;[items[index], items[target]] = [items[target], items[index]]
    }
    return items
  }
}

window.MiniGameQuiz = MiniGameQuiz
