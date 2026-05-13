// Diagnosis: modal de diagnóstico previo antes de cualquier acción de cuidado.
// Implementa RF-31 / LM4 (Analizar) de la metodología LM-GM.
//
// Flujo:
//   1. Selecciona escenario según estado_planta
//   2. Muestra modal con 3 opciones contextuales
//   3. Registra resultado via submitDiagnosis (XP + estadísticas)
//   4. Siempre permite proceder — el aprendizaje ocurre en la explicación
//
// Uso:
//   const canProceed = await Diagnosis.run(plant, 'water')

const Diagnosis = {

  // Banco de escenarios por estado visual de la planta.
  // correctIndex: índice de la opción correcta (0-based).
  _scenarios: {
    SANA: {
      question:   '¿Qué acción es más adecuada para una planta saludable?',
      situation:  'Tu planta tiene buen color y aspecto saludable.',
      options: [
        'Regar aunque no lo necesite, para asegurarme',
        'Observar y actuar solo si muestra señales de necesidad',
        'Aplicar abono para que crezca más rápido'
      ],
      correctIndex: 1,
      explanation:  'Una planta sana no necesita intervención. El riego o abono excesivo puede dañarla. Observar es la decisión correcta.'
    },
    MARCHITA: {
      question:   '¿Qué crees que necesita tu planta ahora?',
      situation:  'Tu planta tiene hojas caídas y aspecto marchito.',
      options: [
        'Le falta agua — necesita riego urgente',
        'Tiene exceso de agua — debo esperar',
        'Necesita más luz solar directa'
      ],
      correctIndex: 0,
      explanation:  'Las hojas caídas y el aspecto marchito son señal clásica de falta de agua. El riego oportuno puede recuperarla.'
    },
    ENFERMA: {
      question:   '¿Qué problema identificas en tu planta?',
      situation:  'Tu planta tiene hojas amarillas y manchas oscuras.',
      options: [
        'Falta de nutrientes — necesita abono',
        'Exceso de riego — raíces posiblemente dañadas',
        'Falta de poda — hojas secas acumuladas'
      ],
      correctIndex: 1,
      explanation:  'Las hojas amarillas con manchas oscuras indican exceso de agua. Deja secar el sustrato antes de actuar.'
    },
    MUERTA: {
      question:   '¿Qué le ocurrió a esta planta?',
      situation:  'Tu planta no tiene señales de vida.',
      options: [
        'Murió por falta de riego prolongada',
        'Murió por exceso de agua y pudrición',
        'No es posible saberlo sin más información'
      ],
      correctIndex: 2,  // Reflexión abierta — no hay una sola causa
      explanation:  'La muerte de una planta puede tener múltiples causas. Revisa tu historial de cuidados en la revisión semanal para identificar el patrón.'
    }
  },

  // Etiquetas legibles para cada tipo de acción
  _actionLabels: {
    water:     'Regar',
    fertilize: 'Abonar',
    prune:     'Podar'
  },

  // Ejecuta el diagnóstico previo.
  // Retorna Promise<true> siempre — el jugador siempre puede proceder.
  run(plant, actionType) {
    return new Promise((resolve) => {

      // Selecciona el escenario según el estado actual de la planta
      const scenarioKey = this._scenarios[plant.estado_planta]
        ? plant.estado_planta
        : 'SANA'
      const scenario = this._scenarios[scenarioKey]

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
                <div class="diag-bar-row">
                  <span class="diag-bar-label">💧 Humedad</span>
                  <div class="diag-bar-bg">
                    <div class="diag-bar-fill diag-bar-water"
                         style="width: ${plant.humedad}%"></div>
                  </div>
                  <span class="diag-bar-val">${plant.humedad}%</span>
                </div>
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

        </div>
      `

      document.body.appendChild(overlay)

      // Manejo de respuesta del jugador
      overlay.querySelectorAll('.diag-option-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const selectedIndex   = parseInt(btn.dataset.index)
          const answeredCorrectly = selectedIndex === scenario.correctIndex

          // Deshabilita todas las opciones al responder
          overlay.querySelectorAll('.diag-option-btn').forEach(b => {
            b.disabled = true
            b.classList.add('disabled')
          })

          // Marca visualmente correcta e incorrecta
          overlay.querySelectorAll('.diag-option-btn')[scenario.correctIndex]
            .classList.add('correct')
          if (!answeredCorrectly) btn.classList.add('incorrect')

          // Registra resultado: XP adicional si acertó (RF-31, RNF-25)
          // Sin id_usuario: submitDiagnosis solo recibe wasCorrect ✅
          const diagResult = await window.gameAPI.submitDiagnosis(answeredCorrectly)

          // Muestra feedback educativo
          const resultEl      = overlay.querySelector('#diag-result')
          const resultTextEl  = overlay.querySelector('#diag-result-text')
          const explanationEl = overlay.querySelector('#diag-explanation')

          resultTextEl.textContent = answeredCorrectly
            ? `✅ ¡Correcto! +${diagResult.xpGained} XP extra`
            : '❌ No era esa la causa principal'
          resultTextEl.className = `diag-result-text ${answeredCorrectly ? 'correct' : 'incorrect'}`

          explanationEl.textContent = scenario.explanation
          resultEl.classList.remove('hidden')

          // Notifica al HUD si ganó XP
          if (diagResult.xpResult) {
            window.dispatchEvent(new CustomEvent('xp:gained', {  // ✅ window
              detail: diagResult.xpResult
            }))
          }
        })
      })

      // "Continuar" siempre resuelve true — el jugador siempre puede actuar
      overlay.addEventListener('click', (e) => {
        if (e.target.id === 'diag-btn-proceed') {
          overlay.remove()   // ✅ más limpio que document.body.removeChild
          resolve(true)
        }
      })
    })
  }
}

window.Diagnosis = Diagnosis