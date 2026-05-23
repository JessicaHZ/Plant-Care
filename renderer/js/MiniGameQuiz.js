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

  _questionBank: [
    {
      category: 'Riego',
      question: 'Por que las hojas de una planta pueden ponerse amarillas?',
      options: [
        'Por exceso de riego o falta de nutrientes',
        'Porque siempre necesitan sol directo',
        'Porque la planta esta creciendo sin problemas',
        'Por falta de poda reciente'
      ],
      correctIndex: 0,
      explanation: 'El amarillamiento suele aparecer por exceso de agua o deficiencia de nitrogeno. Primero revisa humedad y drenaje.'
    },
    {
      category: 'Luz',
      question: 'Cual es la diferencia entre luz directa e indirecta?',
      options: [
        'No hay diferencia practica entre ambas',
        'La directa toca la planta sin filtro; la indirecta llega suavizada',
        'La indirecta siempre es mas intensa que la directa',
        'Solo las plantas de exterior usan luz directa'
      ],
      correctIndex: 1,
      explanation: 'La luz directa incide sin obstaculos. La indirecta es filtrada o reflejada, ideal para muchas plantas tropicales.'
    },
    {
      category: 'Poda',
      question: 'Cuando conviene podar una planta?',
      options: [
        'Cada semana sin importar su estado',
        'Cuando hay hojas secas, danadas o crecimiento descontrolado',
        'Justo despues de regarla abundantemente',
        'Cuando esta sana para acelerar su deterioro'
      ],
      correctIndex: 1,
      explanation: 'La poda debe tener proposito: retirar tejido deteriorado o controlar forma. Podar sin necesidad causa estres.'
    },
    {
      category: 'Nutrientes',
      question: 'Para que sirve el abono?',
      options: [
        'Reemplaza el riego cuando se olvida aplicar agua',
        'Aporta nutrientes que el sustrato agota con el tiempo',
        'Endurece la tierra para proteger las raices',
        'Elimina cualquier plaga automaticamente'
      ],
      correctIndex: 1,
      explanation: 'El abono repone nutrientes esenciales como nitrogeno, fosforo y potasio. No sustituye agua ni control sanitario.'
    },
    {
      category: 'Riego',
      question: 'Que indica una planta con hojas caidas y sustrato seco?',
      options: [
        'Exceso de luz solar',
        'Necesidad urgente de poda',
        'Falta de agua',
        'Temperatura demasiado baja'
      ],
      correctIndex: 2,
      explanation: 'Hojas caidas con tierra seca indican deshidratacion. Riega lentamente hasta humedecer el sustrato de forma uniforme.'
    },
    {
      category: 'Luz',
      question: 'Que pasa si una planta de sombra recibe sol directo intenso?',
      options: [
        'Crece mas rapido y florece siempre',
        'Sus hojas pueden quemarse o necrosarse',
        'No le afecta porque todas necesitan sol directo',
        'Se vuelve mas resistente a la sequia'
      ],
      correctIndex: 1,
      explanation: 'Muchas plantas de sombra tienen hojas sensibles. El sol directo fuerte puede quemar tejido foliar.'
    },
    {
      category: 'Riego',
      question: 'Como debe regarse generalmente una suculenta?',
      options: [
        'Todos los dias para mantener humedad constante',
        'Cada dos dias como cualquier planta',
        'Solo cuando el sustrato esta completamente seco',
        'Nunca, porque almacena agua para siempre'
      ],
      correctIndex: 2,
      explanation: 'Las suculentas almacenan agua. El metodo seguro es regar bien y esperar a que el sustrato se seque.'
    },
    {
      category: 'Sustrato',
      question: 'Que es el drenaje del sustrato?',
      options: [
        'Quitar hojas secas manualmente',
        'La capacidad de dejar salir el exceso de agua',
        'Un tipo de fertilizante liquido',
        'La cantidad de luz que absorbe la planta'
      ],
      correctIndex: 1,
      explanation: 'Un buen drenaje evita agua estancada y reduce el riesgo de pudricion de raices.'
    },
    {
      category: 'Plagas',
      question: 'Cual es una forma segura de controlar pulgones?',
      options: [
        'Regar mas seguido',
        'Aplicar jabon potasico diluido',
        'Podar toda la planta',
        'Agregar mucho abono'
      ],
      correctIndex: 1,
      explanation: 'El jabon potasico ayuda a controlar pulgones sin ser tan agresivo como tratamientos no selectivos.'
    },
    {
      category: 'Trasplante',
      question: 'Cuando suele ser necesario trasplantar?',
      options: [
        'Cada mes obligatoriamente',
        'Cuando las raices salen por el drenaje',
        'Siempre durante invierno',
        'Solo cuando aparecen flores'
      ],
      correctIndex: 1,
      explanation: 'Raices saliendo por debajo indican poco espacio. Un trasplante oportuno mejora crecimiento y absorcion.'
    },
    {
      category: 'Nutrientes',
      question: 'Que nutriente favorece principalmente el crecimiento de hojas?',
      options: [
        'Fosforo',
        'Nitrogeno',
        'Calcio',
        'Azufre'
      ],
      correctIndex: 1,
      explanation: 'El nitrogeno participa en clorofila y crecimiento vegetativo, especialmente hojas y tallos.'
    },
    {
      category: 'Biologia vegetal',
      question: 'Que es la fotosintesis?',
      options: [
        'Absorber agua sin usar luz',
        'Convertir luz, agua y CO2 en azucares',
        'Reproducirse solo durante el dia',
        'Eliminar hojas viejas naturalmente'
      ],
      correctIndex: 1,
      explanation: 'En la fotosintesis la planta usa energia luminosa para producir azucares a partir de agua y dioxido de carbono.'
    },
    {
      category: 'Sustrato',
      question: 'Que rango de pH prefieren muchas plantas ornamentales?',
      options: [
        'Muy acido, cerca de 3',
        'Ligeramente acido a neutro, cerca de 6 a 7',
        'Muy alcalino, cerca de 10',
        'El pH nunca influye'
      ],
      correctIndex: 1,
      explanation: 'Un pH cercano a 6-7 facilita la disponibilidad de muchos nutrientes para las raices.'
    },
    {
      category: 'Prevencion',
      question: 'Cual es una buena practica para prevenir plagas?',
      options: [
        'Revisar hojas y tallos cada semana',
        'Regar aunque el sustrato este mojado',
        'Aplicar abono todos los dias',
        'Mantener todas las plantas en oscuridad'
      ],
      correctIndex: 0,
      explanation: 'La revision periodica permite detectar plagas temprano, antes de que se propaguen.'
    },
    {
      category: 'Biologia vegetal',
      question: 'Que es la clorofila?',
      options: [
        'Una vitamina para raices',
        'Un pigmento verde que captura luz',
        'Un tipo de agua mineral',
        'Una enfermedad foliar'
      ],
      correctIndex: 1,
      explanation: 'La clorofila da color verde y participa en la captura de energia luminosa.'
    },
    {
      category: 'Nutrientes',
      question: 'En que temporada suele aprovecharse mejor el abono?',
      options: [
        'Cuando la planta esta en crecimiento activo',
        'Solo en la noche',
        'Siempre en reposo invernal',
        'Unicamente despues de podar'
      ],
      correctIndex: 0,
      explanation: 'Durante crecimiento activo la planta demanda y aprovecha mejor los nutrientes disponibles.'
    },
    {
      category: 'Nutrientes',
      question: 'Que funcion cumple el potasio en las plantas?',
      options: [
        'Da color verde por si solo',
        'Ayuda a regular agua y fortalecer tejidos',
        'Elimina plagas al contacto',
        'Sustituye completamente al fosforo'
      ],
      correctIndex: 1,
      explanation: 'El potasio participa en regulacion hidrica, resistencia y funcionamiento general de tejidos vegetales.'
    },
    {
      category: 'Propagacion',
      question: 'Como se reproduce facilmente un pothos?',
      options: [
        'Por esquejes colocados en agua o sustrato',
        'Solo por semillas raras',
        'Por esporas bajo la hoja',
        'Dividiendo sus flores'
      ],
      correctIndex: 0,
      explanation: 'El pothos forma raices con facilidad desde nudos del tallo, por eso se propaga bien por esquejes.'
    },
    {
      category: 'Humedad',
      question: 'Que planta suele necesitar humedad ambiental alta?',
      options: [
        'Cactus',
        'Echeveria',
        'Calathea',
        'Mammillaria'
      ],
      correctIndex: 2,
      explanation: 'La Calathea es tropical; prefiere humedad ambiental alta y luz indirecta.'
    },
    {
      category: 'Especies',
      question: 'Que caracteriza a la Tradescantia zebrina?',
      options: [
        'Espinas duras en el tallo',
        'Hojas con tonos morados y verdosos',
        'Flores gigantes permanentes',
        'Necesidad de sequia extrema'
      ],
      correctIndex: 1,
      explanation: 'La Tradescantia zebrina destaca por hojas de tonos morado, verde y plateado, ademas de crecimiento rapido.'
    },
    {
      category: 'Sanidad',
      question: 'Como puede identificarse oidio en hojas?',
      options: [
        'Por polvo blanco sobre la superficie foliar',
        'Por raices saliendo de la maceta',
        'Por crecimiento de hojas nuevas',
        'Por flores mas grandes'
      ],
      correctIndex: 0,
      explanation: 'El oidio suele verse como una capa blanca similar a polvo sobre hojas y tallos.'
    },
    {
      category: 'Poda',
      question: 'Para que sirve la poda de mantenimiento?',
      options: [
        'Cortar raices sanas cada semana',
        'Eliminar ramas u hojas secas y redirigir energia',
        'Quitar todo el sustrato',
        'Reemplazar el riego'
      ],
      correctIndex: 1,
      explanation: 'Retirar tejido seco o danado ayuda a la planta a conservar energia y reduce focos de enfermedad.'
    },
    {
      category: 'Riego',
      question: 'Que riesgo produce el exceso de agua?',
      options: [
        'Pudricion de raices por falta de oxigeno',
        'Mayor fotosintesis inmediata',
        'Raices mas fuertes siempre',
        'Eliminacion de toda plaga'
      ],
      correctIndex: 0,
      explanation: 'El sustrato saturado reduce oxigeno disponible y favorece pudricion radicular.'
    },
    {
      category: 'Luz',
      question: 'Que planta tolera mejor condiciones de poca luz?',
      options: [
        'Pothos',
        'Lavanda',
        'Rosa de sol pleno',
        'Cactus desertico'
      ],
      correctIndex: 0,
      explanation: 'El pothos tolera luz baja mejor que muchas especies, aunque crece mas vigoroso con luz indirecta.'
    }
  ],

  start(onFinish) {
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
      <p><strong>${isCorrect ? 'Correcto' : 'Incorrecto'}</strong></p>
      <p>${question.explanation}</p>
      <button class="btn btn-primary" id="btn-next-question">
        ${isLastQuestion ? 'Ver resultado' : 'Siguiente'}
      </button>
    `
    feedback.classList.remove('hidden')
  },

  _showFinalResult() {
    if (this._correct === this._questions.length) {
      window.gameAPI.grantQuizPerfectAchievement()
    }

    const percentage = Math.round((this._correct / this._questions.length) * 100)
    const level = this._resultLevel(percentage)
    const streakNote = this._correct > 0
      ? '<p class="result-streak">Tu respuesta correcta conto para la racha de hoy.</p>'
      : ''

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

  _resultLevel(percentage) {
    if (percentage >= 80) {
      return {
        icon: '*',
        message: 'Excelente dominio de conceptos de cuidado vegetal.'
      }
    }

    if (percentage >= 60) {
      return {
        icon: '+',
        message: 'Buen resultado. Sigue practicando para reforzar decisiones de cuidado.'
      }
    }

    return {
      icon: '!',
      message: 'Hay conceptos por reforzar. Revisa riego, luz, sustrato y poda.'
    }
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
