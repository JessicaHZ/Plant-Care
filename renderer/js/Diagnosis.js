// Diagnosis: modal de diagnóstico previo antes de cualquier acción de cuidado.
// Implementa RF-31 / LM4 (Analizar) de la metodología LM-GM.
//
// Cambios v2:
//   - Botón cancelar antes de responder (Problema 1)
//   - Escenarios granulares basados en humedad + salud + estado (Problema 2)
//   - Sistema adaptativo por nivel: frecuencia de aparición según progreso (Problema 3)

const Diagnosis = {

  _actionLabels: {
    water:     'Regar',
    fertilize: 'Abonar',
    prune:     'Podar'
  },

  // ── Banco de escenarios granulares ───────────────────────────────────────
  // Selección basada en humedad + salud + estado para mayor precisión educativa
  _scenarios: {

    // Planta sana con exceso de agua (humedad > 80)
    SANA_EXCESO_AGUA: {
      question:   '¿Qué observas en los indicadores de tu planta?',
      situation:  'Tu planta tiene buen aspecto pero la humedad está muy alta.',
      options: [
        'Tiene demasiada agua — debo esperar antes de regar',
        'Necesita más agua para crecer mejor',
        'Está bien, puedo actuar sin problema'
      ],
      correctIndex: 0,
      explanation:  'Con humedad por encima del 80% el sustrato aún está saturado. Regar ahora puede pudrir las raíces aunque la planta luzca bien.'
    },

    // Planta sana con poca agua (humedad < 30)
    SANA_NECESITA_AGUA: {
      question:   '¿Qué indica el nivel de humedad de tu planta?',
      situation:  'Tu planta luce bien pero la humedad está bajando.',
      options: [
        'La humedad está baja — pronto necesitará agua',
        'Está perfecta, no necesita nada',
        'Necesita abono para compensar la falta de agua'
      ],
      correctIndex: 0,
      explanation:  'Aunque la planta aún luce saludable, la humedad baja indica que pronto necesitará riego. Actuar a tiempo evita el marchitamiento.'
    },

    // Planta sana en estado normal
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

    // Planta marchita con humedad alta (exceso de agua, no falta)
    MARCHITA_EXCESO: {
      question:   '¿Por qué crees que tu planta está marchita si tiene tanta agua?',
      situation:  'Tu planta está marchita pero la humedad es alta.',
      options: [
        'Le falta agua — debo regar más',
        'Tiene exceso de agua — las raíces no pueden respirar',
        'Necesita poda urgente para recuperarse'
      ],
      correctIndex: 1,
      explanation:  'Una planta marchita con humedad alta indica exceso de riego. Las raíces se pudren sin oxígeno. Deja secar el sustrato antes de volver a actuar.'
    },

    // Planta marchita por falta de agua (caso normal)
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

    // Planta enferma con humedad alta (exceso de agua)
    ENFERMA_EXCESO: {
      question:   '¿Qué problema identificas en tu planta enferma?',
      situation:  'Tu planta tiene manchas y hojas amarillas con humedad muy alta.',
      options: [
        'Falta de nutrientes — necesita abono urgente',
        'Exceso de riego prolongado — raíces dañadas',
        'Falta de luz — debo cambiarla de lugar'
      ],
      correctIndex: 1,
      explanation:  'Las hojas amarillas con manchas y humedad alta son señal clara de pudrición por exceso de agua. Retira el exceso y deja secar antes de actuar.'
    },

    // Planta enferma con humedad baja (falta de agua prolongada)
    ENFERMA: {
      question:   '¿Qué problema identificas en tu planta?',
      situation:  'Tu planta tiene hojas amarillas y manchas oscuras.',
      options: [
        'Falta de nutrientes — necesita abono',
        'Exceso de riego — raíces posiblemente dañadas',
        'Falta de poda — hojas secas acumuladas'
      ],
      correctIndex: 1,
      explanation:  'Las hojas amarillas con manchas oscuras indican exceso de agua acumulado. Deja secar el sustrato antes de actuar.'
    },

    MUERTA: {
      question:   '¿Qué le ocurrió a esta planta?',
      situation:  'Tu planta no tiene señales de vida.',
      options: [
        'Murió por falta de riego prolongada',
        'Murió por exceso de agua y pudrición',
        'No es posible saberlo sin más información'
      ],
      correctIndex: 2,
      explanation:  'La muerte de una planta puede tener múltiples causas. Revisa tu historial en la revisión semanal para identificar el patrón.'
    }
  },

  // ── Sistema adaptativo por nivel (Problema 3) ────────────────────────────
  // Determina si debe mostrarse el diagnóstico según el nivel del jugador.
  // Nivel 1-2: siempre aparece
  // Nivel 3-4: aparece 1 de cada 3 acciones (aleatoriamente)
  // Nivel 5+:  solo si la planta está MARCHITA o ENFERMA
  async _shouldShowDiagnosis(plant) {
    const result = await window.gameAPI.getProgress()
    const nivel  = result.success ? result.progress.nivel : 1

    if (nivel <= 2) return true

    if (nivel <= 4) {
      // 1 de cada 3 acciones — aleatoriamente
      return Math.random() < 0.33
    }

    // Nivel 5+: solo en plantas con problemas
    return plant.estado_planta === 'MARCHITA' || plant.estado_planta === 'ENFERMA'
  },

  // ── Selector de escenario granular (Problema 2) ──────────────────────────
  // Combina estado_planta + humedad + salud para elegir el escenario correcto
  _selectScenario(plant) {
    const { estado_planta, humedad, salud } = plant

    if (estado_planta === 'MUERTA')  return this._scenarios.MUERTA

    if (estado_planta === 'ENFERMA') {
      return humedad > 70
        ? this._scenarios.ENFERMA_EXCESO
        : this._scenarios.ENFERMA
    }

    if (estado_planta === 'MARCHITA') {
      return humedad > 70
        ? this._scenarios.MARCHITA_EXCESO
        : this._scenarios.MARCHITA
    }

    // Planta SANA — diferencia por nivel de humedad
    if (humedad > 80) return this._scenarios.SANA_EXCESO_AGUA
    if (humedad < 30) return this._scenarios.SANA_NECESITA_AGUA
    return this._scenarios.SANA
  },
  
  //creo que aqui esta bien 
  // Genera el HTML de la barra de humedad con color adaptativo.
  // Rojo: seca (0-30%) | Azul: óptima (30-75%) | Naranja: saturada (75%+)
  _getHumidityBarHTML(humedad) {
  const colorClass =
    humedad < 30  ? 'diag-bar-water-low'     :
    humedad <= 75 ? 'diag-bar-water-optimal' :
                    'diag-bar-water-high'

  const label =
    humedad < 30  ? '💧 Humedad (baja)'     :
    humedad <= 75 ? '💧 Humedad (óptima)'   :
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

  // ── Punto de entrada principal ───────────────────────────────────────────
  // Retorna Promise<true> si puede proceder, Promise<false> si cancela
  async run(plant, actionType) {
    // Sistema adaptativo: decide si mostrar según nivel
    const shouldShow = await this._shouldShowDiagnosis(plant)
    if (!shouldShow) return true   // nivel alto + planta sana = sin diagnóstico

    return new Promise((resolve) => {
      const scenario = this._selectScenario(plant)
      const overlay  = document.createElement('div')
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

          <!-- ✅ Problema 1: botón cancelar visible antes de responder -->
          <div id="diag-cancel-row" style="text-align:center; margin-top:0.5rem">
            <button class="btn btn-ghost" id="diag-btn-cancel"
                    style="font-size:0.8rem; color:var(--color-text-muted)">
              Cancelar acción
            </button>
          </div>

        </div>
      `

      document.body.appendChild(overlay)

      // ── Respuesta del jugador ─────────────────────────────────────────────
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

          // Oculta el botón cancelar una vez respondido
          const cancelRow = overlay.querySelector('#diag-cancel-row')
          if (cancelRow) cancelRow.style.display = 'none'

          // Registra resultado en BD
          const diagResult = await window.gameAPI.submitDiagnosis(answeredCorrectly)

          // Muestra feedback
          const resultEl      = overlay.querySelector('#diag-result')
          const resultTextEl  = overlay.querySelector('#diag-result-text')
          const explanationEl = overlay.querySelector('#diag-explanation')

          resultTextEl.textContent = answeredCorrectly
            ? `✅ ¡Correcto! +${diagResult.xpGained} XP extra`
            : '❌ No era esa la causa principal'
          resultTextEl.className = `diag-result-text ${answeredCorrectly ? 'correct' : 'incorrect'}`

          explanationEl.textContent = scenario.explanation
          resultEl.classList.remove('hidden')

          if (diagResult.xpResult) {
            window.dispatchEvent(new CustomEvent('xp:gained', {
              detail: diagResult.xpResult
            }))
          }
        })
      })

      // ── Delegación de clicks del overlay ─────────────────────────────────
      overlay.addEventListener('click', (e) => {

        // Continuar con la acción
        if (e.target.id === 'diag-btn-proceed') {
          overlay.remove()
          resolve(true)
          return
        }

        // ✅ Cancelar — cierra el modal sin ejecutar la acción
        if (e.target.id === 'diag-btn-cancel') {
          overlay.remove()
          resolve(false)
        }
      })
    })
  }

  
}



window.Diagnosis = Diagnosis