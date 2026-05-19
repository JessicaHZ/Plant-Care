const Diagnosis = {

  _actionLabels: {
    water:     'Regar',
    fertilize: 'Abonar',
    prune:     'Podar',
    drain:     'Drenar'
  },

  _scenarios: {
    SANA_EXCESO_AGUA: {
      question:    '¿Qué deberías hacer si tu planta tiene exceso de agua?',
      situation:   'Tu planta tiene buen aspecto pero la humedad está muy alta.',
      options: [
        'Drenar el exceso inclinando la maceta y secando el sustrato',
        'Regar de todas formas — siempre necesita agua',
        'Aplicar abono para compensar el daño del exceso'
      ],
      correctIndex: 0,
      explanation:  'Con exceso de agua las raíces no pueden respirar. La solución es drenar: inclinar la maceta, secar el sustrato con servilletas y mejorar la ventilación. Nunca riegues más cuando ya hay exceso.',
      onCorrect:    'drain'
    },
    SANA_NECESITA_AGUA: {
      question:    '¿Qué indica el nivel de humedad de tu planta?',
      situation:   'Tu planta luce bien pero la humedad está bajando.',
      options: [
        'La humedad está baja — pronto necesitará agua',
        'Está perfecta, no necesita nada',
        'Necesita abono para compensar la falta de agua'
      ],
      correctIndex: 0,
      explanation:  'Aunque la planta aún luce saludable, la humedad baja indica que pronto necesitará riego. Actuar a tiempo evita el marchitamiento.'
    },
    SANA: {
      question:    '¿Qué acción es más adecuada para una planta saludable?',
      situation:   'Tu planta tiene buen color y aspecto saludable.',
      options: [
        'Regar aunque no lo necesite, para asegurarme',
        'Observar y actuar solo si muestra señales de necesidad',
        'Aplicar abono para que crezca más rápido'
      ],
      correctIndex: 1,
      explanation:  'Una planta sana no necesita intervención. El riego o abono excesivo puede dañarla. Observar es la decisión correcta.'
    },
    MARCHITA_EXCESO: {
      question:    '¿Por qué crees que tu planta está marchita si tiene tanta agua?',
      situation:   'Tu planta está marchita pero la humedad es alta.',
      options: [
        'Le falta agua — debo regar más',
        'Tiene exceso de agua — las raíces no pueden respirar',
        'Necesita poda urgente para recuperarse'
      ],
      correctIndex: 1,
      explanation:  'Una planta marchita con humedad alta indica exceso de riego. Las raíces se pudren sin oxígeno. Deja secar el sustrato o drena el exceso.',
      onCorrect:    'drain'
    },
    MARCHITA: {
      question:    '¿Qué crees que necesita tu planta ahora?',
      situation:   'Tu planta tiene hojas caídas y aspecto marchito.',
      options: [
        'Le falta agua — necesita riego urgente',
        'Tiene exceso de agua — debo esperar',
        'Necesita más luz solar directa'
      ],
      correctIndex: 0,
      explanation:  'Las hojas caídas y el aspecto marchito son señal clásica de falta de agua. El riego oportuno puede recuperarla.'
    },
    ENFERMA_EXCESO: {
      question:    '¿Qué problema identificas en tu planta enferma?',
      situation:   'Tu planta tiene manchas y hojas amarillas con humedad muy alta.',
      options: [
        'Falta de nutrientes — necesita abono urgente',
        'Exceso de riego prolongado — raíces dañadas',
        'Falta de luz — debo cambiarla de lugar'
      ],
      correctIndex: 1,
      explanation:  'Las hojas amarillas con manchas y humedad alta son señal clara de pudrición por exceso de agua. Retira el exceso y deja secar antes de actuar.'
    },
    ENFERMA: {
      question:    '¿Qué problema identificas en tu planta?',
      situation:   'Tu planta tiene hojas amarillas y manchas oscuras.',
      options: [
        'Falta de nutrientes — necesita abono',
        'Exceso de riego — raíces posiblemente dañadas',
        'Falta de poda — hojas secas acumuladas'
      ],
      correctIndex: 1,
      explanation:  'Las hojas amarillas con manchas oscuras indican exceso de agua acumulado. Deja secar el sustrato antes de actuar.'
    },
    MUERTA: {
      question:    '¿Qué le ocurrió a esta planta?',
      situation:   'Tu planta no tiene señales de vida.',
      options: [
        'Murió por falta de riego prolongada',
        'Murió por exceso de agua y pudrición',
        'No es posible saberlo sin más información'
      ],
      correctIndex: 2,
      explanation:  'La muerte de una planta puede tener múltiples causas. Revisa tu historial en la revisión semanal para identificar el patrón.'
    }
  },

  async _shouldShowDiagnosis(plant) {
    const result = await window.gameAPI.getProgress()
    const nivel  = result.success ? result.progress.nivel : 1

    if (nivel <= 2) return true
    if (nivel <= 4) return Math.random() < 0.33
    return plant.estado_planta === 'MARCHITA' || plant.estado_planta === 'ENFERMA'
  },

  _selectScenario(plant) {
    const { estado_planta, humedad } = plant

    if (estado_planta === 'MUERTA')   return this._scenarios.MUERTA
    if (estado_planta === 'ENFERMA')  return humedad > 70
      ? this._scenarios.ENFERMA_EXCESO
      : this._scenarios.ENFERMA
    if (estado_planta === 'MARCHITA') return humedad > 70
      ? this._scenarios.MARCHITA_EXCESO
      : this._scenarios.MARCHITA

    if (humedad > 75) return this._scenarios.SANA_EXCESO_AGUA
    if (humedad < 40) return this._scenarios.SANA_NECESITA_AGUA
    return this._scenarios.SANA
  },

  _getHumidityBarHTML(humedad) {
    const colorClass =
      humedad < 40  ? 'diag-bar-water-low'     :
      humedad <= 75 ? 'diag-bar-water-optimal' :
                      'diag-bar-water-high'

    const label =
      humedad < 40  ? '💧 Humedad (baja)'    :
      humedad <= 75 ? '💧 Humedad (óptima)'  :
                      '💧 Humedad (saturada)'

    return `
      <div class="diag-bar-row">
        <span class="diag-bar-label">${label}</span>
        <div class="diag-bar-bg">
          <div class="diag-bar-fill ${colorClass}"
               style="width: ${humedad}%"></div>
        </div>
        <span class="diag-bar-val">${humedad}%</span>
      </div>
    `
  },

  async run(plant, actionType) {
    const shouldShow = await this._shouldShowDiagnosis(plant)
    if (!shouldShow) return true

    return new Promise((resolve) => {
      const scenario    = this._selectScenario(plant)
      let drainExecuted = false   // ✅ variable local, no en el objeto escenario

      const overlay = document.createElement('div')
      overlay.className = 'diagnosis-overlay'

      overlay.innerHTML = `
        <div class="diagnosis-modal">
          <div class="diagnosis-header">
            <span class="diagnosis-icon">🔍</span>
            <h2 class="diagnosis-title">Diagnóstico previo</h2>
            <p class="diagnosis-subtitle">
              Antes de <strong>${this._actionLabels[actionType] || 'actuar'}</strong>,
              analiza el estado de tu planta
            </p>
          </div>

          <div class="diagnosis-plant-state">
            <img
              class="diagnosis-plant-img"
              src="../assets/sprites/plants/${plant.sprite_key}_${plant.estado_planta.toLowerCase()}.png"
              onerror="this.src='../assets/sprites/plants/placeholder.png'"
              alt="${plant.nombre_planta}"
            />
            <div class="diagnosis-situation">
              <p class="diagnosis-plant-name">${plant.nombre_planta}</p>
              <p class="diagnosis-situation-text">${scenario.situation}</p>
              <div class="diagnosis-bars">
                ${this._getHumidityBarHTML(plant.humedad)}
                <div class="diag-bar-row">
                  <span class="diag-bar-label">❤️ Salud</span>
                  <div class="diag-bar-bg">
                    <div class="diag-bar-fill diag-bar-health"
                         style="width: ${plant.salud}%"></div>
                  </div>
                  <span class="diag-bar-val">${plant.salud}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="diagnosis-question">
            <p class="diagnosis-q-text">${scenario.question}</p>
            <div class="diagnosis-options" id="diag-options">
              ${scenario.options.map((opt, i) => `
                <button class="diag-option-btn" data-index="${i}">${opt}</button>
              `).join('')}
            </div>
          </div>

          <div class="diagnosis-result hidden" id="diag-result">
            <p class="diag-result-text" id="diag-result-text"></p>
            <p class="diag-explanation"  id="diag-explanation"></p>
            <button class="btn btn-primary" id="diag-btn-proceed">
              Continuar con la acción →
            </button>
          </div>

          <div id="diag-cancel-row" style="text-align:center; margin-top:0.5rem">
            <button class="btn btn-ghost" id="diag-btn-cancel"
                    style="font-size:0.8rem; color:var(--color-text-muted)">
              Cancelar acción
            </button>
          </div>
        </div>
      `

      document.body.appendChild(overlay)

      // ── Respuesta del jugador ─────────────────────────────────────────
      overlay.querySelectorAll('.diag-option-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const selectedIndex     = parseInt(btn.dataset.index)
          const answeredCorrectly = selectedIndex === scenario.correctIndex

          // Deshabilita opciones
          overlay.querySelectorAll('.diag-option-btn').forEach(b => {
            b.disabled = true
            b.classList.add('disabled')
          })

          // Marca correcta e incorrecta
          overlay.querySelectorAll('.diag-option-btn')[scenario.correctIndex]
            .classList.add('correct')
          if (!answeredCorrectly) btn.classList.add('incorrect')

          // Oculta cancelar una vez respondido
          const cancelRow = overlay.querySelector('#diag-cancel-row')
          if (cancelRow) cancelRow.style.display = 'none'

          // ✅ Ejecuta drenaje si acertó y el escenario lo requiere
          if (answeredCorrectly && scenario.onCorrect === 'drain') {
            await window.gameAPI.drainPlant(plant.id_registro)
            drainExecuted = true   // ✅ marca en variable local del closure
          }

          const diagResult = await window.gameAPI.submitDiagnosis(answeredCorrectly)

          const resultEl      = overlay.querySelector('#diag-result')
          const resultTextEl  = overlay.querySelector('#diag-result-text')
          const explanationEl = overlay.querySelector('#diag-explanation')

          if (answeredCorrectly && scenario.onCorrect === 'drain') {
            resultTextEl.textContent = `✅ ¡Correcto! Drenaje aplicado. +${diagResult.xpGained} XP extra`
          } else {
            resultTextEl.textContent = answeredCorrectly
              ? `✅ ¡Correcto! +${diagResult.xpGained} XP extra`
              : '❌ No era esa la causa principal'
          }

          resultTextEl.className    = `diag-result-text ${answeredCorrectly ? 'correct' : 'incorrect'}`
          explanationEl.textContent = scenario.explanation
          resultEl.classList.remove('hidden')

          if (diagResult.xpResult) {
            window.dispatchEvent(new CustomEvent('xp:gained', {
              detail: diagResult.xpResult
            }))
          }
        })
      })

      // ── Botones de navegación ─────────────────────────────────────────
      overlay.addEventListener('click', (e) => {
        if (e.target.id === 'diag-btn-proceed') {
          overlay.remove()
          // ✅ Si drenaje ya se ejecutó, retorna 'drained' para que
          // CareActions NO ejecute el riego encima
          resolve(drainExecuted ? 'drained' : true)
          return
        }
        if (e.target.id === 'diag-btn-cancel') {
          overlay.remove()
          resolve(false)
        }
      })
    })
  }

}

window.Diagnosis = Diagnosis