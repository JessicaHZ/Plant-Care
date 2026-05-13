// MiniGamePests: minijuego de identificación y tratamiento de plagas.
// Implementa LM3 + LM4 — Aplicar + Analizar.
// El jugador analiza síntomas y elige el tratamiento correcto.

const MiniGamePests = {

  _onFinish:        null,
  _currentScenario: null,

  _scenarios: [
    {
      id:      1,
      title:   'Manchas blancas en el envés de las hojas',
      image:   '🍃',
      symptom: 'Tu planta tiene pequeños puntos blancos en la parte inferior de las hojas. Las hojas se ven amarillentas y empiezan a caer.',
      options: [
        { text: 'Regar más frecuentemente',                        correct: false },
        { text: 'Tratar con jabón potásico y aislar la planta',    correct: true  },
        { text: 'Podar todas las hojas afectadas',                 correct: false },
        { text: 'Aplicar más abono para fortalecer',               correct: false },
      ],
      explanation: 'Los puntos blancos en el envés indican cochinilla harinosa o araña roja. El jabón potásico las elimina sin dañar la planta. Aislarla evita que la plaga se propague.'
    },
    {
      id:      2,
      title:   'Hongos en la superficie del sustrato',
      image:   '🌱',
      symptom: 'La tierra de tu planta tiene un moho blanco en la superficie y la planta luce decaída aunque la riegas regularmente.',
      options: [
        { text: 'Regar más para que el hongo desaparezca',         correct: false },
        { text: 'Cambiar el sustrato y mejorar el drenaje',        correct: true  },
        { text: 'Agregar abono para recuperar la planta',          correct: false },
        { text: 'Podar las raíces visibles',                       correct: false },
      ],
      explanation: 'El moho blanco en el sustrato indica exceso de humedad y mal drenaje. La solución es cambiar la tierra por una mezcla con mejor drenaje y reducir el riego.'
    },
    {
      id:      3,
      title:   'Hojas con bordes quemados y marrones',
      image:   '🌿',
      symptom: 'Los bordes de las hojas de tu planta se están poniendo marrones y crujientes, empezando por las puntas.',
      options: [
        { text: 'Aumentar el riego inmediatamente',                                              correct: false },
        { text: 'Alejar la planta del calor directo y aumentar la humedad ambiental',            correct: true  },
        { text: 'Podar todas las hojas marrones de inmediato',                                   correct: false },
        { text: 'Aplicar fungicida preventivo',                                                  correct: false },
      ],
      explanation: 'Los bordes marrones y crujientes son signo de baja humedad ambiental o exposición a calor directo. Alejar la planta y usar un humidificador resuelve el problema.'
    },
  ],

  // Sin userId — sesión local única
  start(onFinish) {
    this._onFinish = onFinish
    this._currentScenario = this._scenarios[
      Math.floor(Math.random() * this._scenarios.length)
    ]
    this._createOverlay()
  },

  _createOverlay() {
    const s       = this._currentScenario
    const overlay = document.createElement('div')
    overlay.id        = 'pests-overlay'
    overlay.className = 'minigame-overlay'

    overlay.innerHTML = `
      <div class="minigame-container">
        <div class="minigame-header">
          <h2 class="minigame-title">🐛 Minijuego de Plagas</h2>
          <p class="minigame-instruction">Identifica el problema y elige el tratamiento correcto</p>
        </div>

        <div class="pests-scenario">
          <div class="pests-plant-display">
            <span class="pests-plant-icon">${s.image}</span>
            <h3 class="pests-symptom-title">${s.title}</h3>
            <p class="pests-symptom-text">${s.symptom}</p>
          </div>

          <div class="pests-options">
            <p class="pests-question">¿Cuál es el tratamiento correcto?</p>
            ${s.options.map((opt, i) => `
              <button class="pests-option-btn" data-index="${i}" data-correct="${opt.correct}">
                ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="pests-result hidden" id="pests-result">
          <p class="pests-result-text" id="pests-result-text"></p>
          <p class="pests-explanation"  id="pests-explanation"></p>
          <button class="btn btn-primary" id="btn-pests-done">Continuar →</button>
        </div>
      </div>
    `

    document.body.appendChild(overlay)
    this._bindEvents(overlay)
  },

  _bindEvents(overlay) {
    // ✅ Delegación de eventos en el overlay — resuelve el bug del botón
    overlay.addEventListener('click', async (e) => {

      // ── Clic en una opción de tratamiento ──────────────────────────────
      const optionBtn = e.target.closest('.pests-option-btn')
      if (optionBtn && !optionBtn.disabled) {
        const isCorrect = optionBtn.dataset.correct === 'true'

        // Deshabilita todas las opciones
        overlay.querySelectorAll('.pests-option-btn').forEach(b => {
          b.disabled = true
          b.classList.add('disabled')
        })

        // Marca correcta e incorrecta visualmente
        overlay.querySelectorAll('.pests-option-btn').forEach(b => {
          if (b.dataset.correct === 'true') b.classList.add('correct')
        })
        if (!isCorrect) optionBtn.classList.add('incorrect')

        // Registra resultado en BD                          ✅ sin userId
        const result = await window.gameAPI.completePestsGame(isCorrect)

        // Muestra feedback educativo
        const resultEl  = overlay.querySelector('#pests-result')
        const textEl    = overlay.querySelector('#pests-result-text')
        const explainEl = overlay.querySelector('#pests-explanation')

        textEl.textContent    = isCorrect
          ? `✅ ¡Correcto! +${result.xpGained} XP`
          : '❌ No era esa la solución correcta'
        textEl.className      = `pests-result-text ${isCorrect ? 'correct' : 'incorrect'}`
        explainEl.textContent = `💡 ${this._currentScenario.explanation}`

        resultEl.classList.remove('hidden')  // ✅ botón ya está en el DOM antes del bind

        // Notifica al HUD si ganó XP
        if (result.xpResult) {
          window.dispatchEvent(new CustomEvent('xp:gained', {  // ✅ window
            detail: result.xpResult
          }))
        }
      }

      // ── Clic en "Continuar" ────────────────────────────────────────────
      if (e.target.id === 'btn-pests-done') {
        overlay.remove()
        if (this._onFinish) this._onFinish(
          overlay.querySelector('.pests-option-btn.correct') !== null
        )
      }

    })
  }

}

window.MiniGamePests = MiniGamePests