// MiniGameQuiz: quiz de 5 preguntas sobre cuidado de plantas.
// Implementa LM1 + LM2 — Recordar + Comprender.
// Una respuesta correcta cuenta para la racha diaria (RF-22).

const MiniGameQuiz = {

  _onFinish:  null,
  _questions: [],
  _current:   0,
  _correct:   0,
  _overlay:   null,   // referencia al overlay para no buscarlo en el DOM

  _allQuestions: [
    {
      question:     '¿Por qué las hojas de una planta se ponen amarillas?',
      options: [
        'Por exceso de riego o falta de nutrientes',
        'Porque necesitan más sol directo',
        'Es una señal de que están creciendo bien',
        'Por falta de poda reciente'
      ],
      correctIndex: 0,
      explanation:  'El amarillamiento es la señal más común de exceso de agua o deficiencia de nitrógeno. Revisa el riego antes de abonar.'
    },
    {
      question:     '¿Cuál es la diferencia entre luz directa e indirecta?',
      options: [
        'No hay diferencia, cualquier luz sirve igual',
        'La luz directa toca la planta sin obstáculos; la indirecta es filtrada',
        'La luz indirecta es más fuerte que la directa',
        'Solo las plantas de exterior necesitan luz directa'
      ],
      correctIndex: 1,
      explanation:  'La luz directa incide sobre las hojas sin filtro. La luz indirecta es más suave, ideal para plantas tropicales de interior.'
    },
    {
      question:     '¿Cuándo es el mejor momento para podar una planta?',
      options: [
        'Cada semana, sin importar su estado',
        'Solo cuando tiene hojas secas, dañadas o el crecimiento es descontrolado',
        'Inmediatamente después de regarla',
        'Cuando la planta está enferma para recuperarla'
      ],
      correctIndex: 1,
      explanation:  'La poda debe hacerse con propósito: eliminar hojas dañadas o controlar el crecimiento. Podar sin necesidad estresa a la planta.'
    },
    {
      question:     '¿Para qué sirve el abono en las plantas?',
      options: [
        'Reemplaza al agua cuando se olvida regar',
        'Aporta nutrientes que el sustrato no puede dar indefinidamente',
        'Endurece la tierra para que las raíces no salgan',
        'Elimina plagas y enfermedades'
      ],
      correctIndex: 1,
      explanation:  'El sustrato agota sus nutrientes con el tiempo. El abono repone nitrógeno, fósforo y potasio esenciales. No reemplaza al riego.'
    },
    {
      question:     '¿Qué indica una planta con hojas caídas y tierra seca?',
      options: [
        'Exceso de luz solar',
        'Necesita ser podada urgentemente',
        'Falta de agua — necesita riego',
        'La temperatura es demasiado baja'
      ],
      correctIndex: 2,
      explanation:  'Hojas caídas con tierra seca es la señal más clara de sed. Riega lentamente hasta que el agua salga por el drenaje.'
    },
    {
      question:     '¿Qué pasa si una planta de sombra recibe luz solar directa intensa?',
      options: [
        'Crece más rápido y produce más flores',
        'Sus hojas se queman y pueden necrosarse',
        'No le afecta porque todas las plantas necesitan sol',
        'Se vuelve más resistente a la sequía'
      ],
      correctIndex: 1,
      explanation:  'Las plantas de sombra tienen hojas más delgadas y sensibles. La luz solar directa intensa las quema literalmente.'
    },
    {
      question:     '¿Con qué frecuencia debe regarse generalmente una suculenta?',
      options: [
        'Todos los días para mantener la tierra húmeda',
        'Cada 2-3 días igual que cualquier planta',
        'Cada 2-3 semanas, solo cuando el sustrato está completamente seco',
        'Nunca; almacenan suficiente agua para siempre'
      ],
      correctIndex: 2,
      explanation:  'Las suculentas almacenan agua en sus hojas. El método correcto es "remojo y secado": regar abundante y esperar a que la tierra se seque completamente.'
    },
    {
      question:     '¿Qué es el drenaje y por qué es importante?',
      options: [
        'El proceso de quitar hojas secas manualmente',
        'La capacidad del sustrato de dejar salir el exceso de agua',
        'Un tipo de abono líquido especial',
        'La cantidad de luz que absorbe la planta'
      ],
      correctIndex: 1,
      explanation:  'Un buen drenaje evita que el agua quede estancada en las raíces, causando pudrición. Usa sustratos porosos y macetas con agujeros.'
    },
  ],

  // Sin userId — sesión local única
  start(onFinish) {
    this._onFinish = onFinish
    this._current  = 0
    this._correct  = 0
    this._questions = this._shuffle([...this._allQuestions]).slice(0, 5)

    this._createOverlay()
    this._renderQuestion()
  },

  _createOverlay() {
    const overlay = document.createElement('div')
    overlay.id        = 'quiz-overlay'
    overlay.className = 'minigame-overlay'
    overlay.innerHTML = `
      <div class="minigame-container">
        <div class="minigame-header">
          <div>
            <h2 class="minigame-title">❓ Quiz de Plantas</h2>
            <p class="minigame-instruction">
              Responde correctamente para ganar XP y mantener tu racha
            </p>
          </div>
          <div class="minigame-stats">
            <div class="mini-stat">
              <span class="mini-stat-label">Pregunta</span>
              <span class="mini-stat-value" id="quiz-progress">1/5</span>
            </div>
            <div class="mini-stat">
              <span class="mini-stat-label">Correctas</span>
              <span class="mini-stat-value" id="quiz-correct">0</span>
            </div>
          </div>
        </div>

        <div id="quiz-question-area"></div>
        <div id="quiz-feedback" class="quiz-feedback hidden"></div>
        <div id="quiz-final"    class="hidden"></div>
      </div>
    `
    document.body.appendChild(overlay)
    this._overlay = overlay

    // ✅ Un solo listener delegado para todo el quiz
    // Elimina la acumulación de handlers que causaba el bug
    overlay.addEventListener('click', (e) => this._handleClick(e))
  },

  // ✅ Delegación central — un handler para todas las interacciones
  async _handleClick(e) {

    // ── Clic en opción de respuesta ──────────────────────────────────────
    const optionBtn = e.target.closest('.quiz-option-btn')
    if (optionBtn && !optionBtn.disabled) {
      await this._handleAnswer(optionBtn)
      return
    }

    // ── Clic en "Siguiente / Ver resultado" ──────────────────────────────
    if (e.target.id === 'btn-next-question') {
      this._current++
      this._renderQuestion()
      return
    }

    // ── Clic en "Continuar" en pantalla final ────────────────────────────
    if (e.target.id === 'btn-quiz-done') {
      this._overlay.remove()
      if (this._onFinish) this._onFinish(this._correct)
    }
  },

  _renderQuestion() {
    if (this._current >= this._questions.length) {
      this._showFinalResult()
      return
    }

    const q    = this._questions[this._current]
    const area = this._overlay.querySelector('#quiz-question-area')
    const feedback = this._overlay.querySelector('#quiz-feedback')

    feedback.classList.add('hidden')

    this._overlay.querySelector('#quiz-progress').textContent =
      `${this._current + 1}/${this._questions.length}`

    area.innerHTML = `
      <div class="quiz-question-card">
        <p class="quiz-question-text">${q.question}</p>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option-btn" data-index="${i}">
              <span class="quiz-opt-letter">${'ABCD'[i]}</span>
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `
    // No se registran listeners aquí — el listener delegado del overlay
    // captura los clics en .quiz-option-btn automáticamente ✅
  },

  async _handleAnswer(btn) {
    const question  = this._questions[this._current]
    const selected  = parseInt(btn.dataset.index)
    const isCorrect = selected === question.correctIndex

    // Deshabilita todas las opciones
    this._overlay.querySelectorAll('.quiz-option-btn').forEach(b => {
      b.disabled = true
      if (parseInt(b.dataset.index) === question.correctIndex) b.classList.add('correct')
    })
    if (!isCorrect) btn.classList.add('incorrect')

    if (isCorrect) this._correct++
    this._overlay.querySelector('#quiz-correct').textContent = this._correct

    // Registra en BD                                         ✅ sin userId
    const result = await window.gameAPI.submitQuiz(isCorrect)

    // Notifica al HUD si ganó XP
    if (result.xpResult) {
      window.dispatchEvent(new CustomEvent('xp:gained', {    // ✅ window
        detail: result.xpResult
      }))
    }

    // Muestra feedback con botón de siguiente
    const feedbackEl = this._overlay.querySelector('#quiz-feedback')
    feedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`
    feedbackEl.innerHTML = `
      <p><strong>${isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}</strong></p>
      <p>${question.explanation}</p>
      <button class="btn btn-primary" id="btn-next-question">
        ${this._current + 1 < this._questions.length ? 'Siguiente →' : 'Ver resultado →'}
      </button>
    `
    feedbackEl.classList.remove('hidden')
    // El listener de btn-next-question lo captura el delegado ✅
  },

  _showFinalResult() {
    const percentage = Math.round((this._correct / this._questions.length) * 100)
    const message    = percentage >= 80
      ? '¡Excelente dominio del cuidado de plantas!'
      : percentage >= 60
        ? 'Buen resultado. Sigue practicando para reforzar tu aprendizaje.'
        : 'Hay conceptos por reforzar. El tutorial puede ayudarte.'

    const streakNote = this._correct > 0
      ? '🔥 Tu respuesta correcta contó para la racha de hoy.'
      : ''

    this._overlay.querySelector('.minigame-container').innerHTML = `
      <div class="minigame-result">
        <div class="result-icon">
          ${percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h2 class="result-title">Resultado del Quiz</h2>
        <div class="result-score-big">
          ${this._correct}<span>/${this._questions.length}</span>
        </div>
        <p class="result-message">${message}</p>
        ${streakNote ? `<p class="result-streak">${streakNote}</p>` : ''}
        <button class="btn btn-primary" id="btn-quiz-done">Continuar →</button>
      </div>
    `
    // btn-quiz-done lo captura el listener delegado ✅
  },

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

}

window.MiniGameQuiz = MiniGameQuiz