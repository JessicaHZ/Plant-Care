const Diagnosis = {

  _actionLabels: {
    water:     'Regar',
    fertilize: 'Abonar',
    prune:     'Podar',
    drain:     'Drenar'
  },

  _scenarios: {
    WATER_LUZ_INCORRECTA: {
      question:    'Antes de regar, que otra causa podria explicar el deterioro?',
      situation:   'La planta no mejora aunque el problema no parece ser solo falta de agua.',
      options: [
        'Revisar si la luz del lugar coincide con la planta',
        'Regar mas para compensar cualquier problema',
        'Podarla aunque no tenga hojas secas'
      ],
      correctIndex: 0,
      explanation:  'No todos los problemas se resuelven con agua. Si la luz no coincide, la planta puede perder salud lentamente.'
    },
    FERTILIZE_NUTRIENTES_BAJOS: {
      question:    'Cuando conviene aplicar abono?',
      situation:   'La planta muestra desgaste gradual y el sustrato podria necesitar apoyo.',
      options: [
        'Cuando los nutrientes estan bajos o la recuperacion se vuelve lenta',
        'Siempre que la planta se vea sana',
        'Cada vez que se riega'
      ],
      correctIndex: 0,
      explanation:  'El abono es una ayuda gradual. Funciona mejor cuando el sustrato esta pobre, no como rutina permanente.'
    },
    FERTILIZE_NUTRIENTES_EXCESO: {
      question:    'Que riesgo tiene abonar sin necesidad?',
      situation:   'La planta ya tiene suficiente alimento en el sustrato.',
      options: [
        'Puede estresar las raices; es mejor esperar',
        'Acelera siempre el crecimiento',
        'Corrige problemas de luz'
      ],
      correctIndex: 0,
      explanation:  'El exceso de nutrientes tambien es un error de cuidado. Observar antes de abonar evita estresar la raiz.'
    },
    PRUNE_NECESARIA: {
      question:    'Que senal justifica usar la poda?',
      situation:   'La planta muestra senales de que podria beneficiarse de un corte cuidadoso.',
      options: [
        'Retirar hojas secas o crecimiento deteriorado para concentrar energia',
        'Cortar hojas sanas para que crezca mas rapido',
        'Podar cualquier planta una vez por semana'
      ],
      correctIndex: 0,
      explanation:  'La poda debe tener proposito. Quitar partes deterioradas ayuda, pero cortar sin necesidad estresa la planta.'
    },
    PRUNE_NO_NECESARIA: {
      question:    'Que conviene hacer si una planta no necesita poda?',
      situation:   'La planta no muestra senales claras para cortar.',
      options: [
        'Esperar y observar antes de podar',
        'Podarla para prevenir cualquier problema',
        'Abonarla para reemplazar la poda'
      ],
      correctIndex: 0,
      explanation:  'Podar sin necesidad puede debilitar una planta sana. La observacion tambien es una decision de cuidado.'
    },
    SANA_EXCESO_AGUA: {
      question:    '¿Qué deberías hacer si la tierra está saturada?',
      situation:   'Tu planta tiene buen aspecto, pero la tierra está demasiado húmeda.',
      options: [
        'Drenar el exceso inclinando la maceta y secando el sustrato',
        'Regar de todas formas — siempre necesita agua',
        'Aplicar abono para compensar el daño del exceso'
      ],
      correctIndex: 0,
      explanation:  'El exceso de agua deja a las raíces sin aire. Drenar ayuda a retirar el sobrante.',
      onCorrect:    'drain'
    },
    SANA_NECESITA_AGUA: {
      question:    '¿Qué indica la tierra seca?',
      situation:   'Tu planta luce bien, pero la tierra empieza a secarse.',
      options: [
        'La humedad está baja — pronto necesitará agua',
        'Está perfecta, no necesita nada',
        'Necesita abono para compensar la falta de agua'
      ],
      correctIndex: 0,
      explanation:  'La tierra seca es una señal temprana. Regar a tiempo evita que la planta se marchite.'
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
      explanation:  'Una planta sana también necesita observación. Actuar sin señales puede causar estrés.'
    },
    MARCHITA_EXCESO: {
      question:    '¿Por qué puede marchitarse una planta con la tierra mojada?',
      situation:   'Tu planta está marchita y la tierra sigue muy húmeda.',
      options: [
        'Le falta agua — debo regar más',
        'Tiene exceso de agua — las raíces no pueden respirar',
        'Necesita poda urgente para recuperarse'
      ],
      correctIndex: 1,
      explanation:  'Con demasiada agua, las raíces no respiran bien. Drena o deja secar antes de volver a regar.',
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
      explanation:  'Las hojas caídas con tierra seca suelen indicar sed. Un riego cuidadoso puede ayudarla.'
    },
    ENFERMA_EXCESO: {
      question:    '¿Qué problema identificas en tu planta enferma?',
      situation:   'Tu planta tiene manchas, hojas amarillas y tierra saturada.',
      options: [
        'Falta de nutrientes — necesita abono urgente',
        'Exceso de riego prolongado — raíces dañadas',
        'Falta de luz — debo cambiarla de lugar'
      ],
      correctIndex: 1,
      explanation:  'Manchas y tierra saturada pueden indicar raíces dañadas. Retira el exceso de agua.'
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
      explanation:  'Las manchas oscuras suelen aparecer cuando la planta ha pasado por estrés. Observa la tierra antes de actuar.'
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
      explanation:  'Una planta puede morir por varias causas. La revisión semanal ayuda a encontrar el patrón.'
    }
  },

  async _shouldShowDiagnosis(plant) {
    const result = await window.gameAPI.getProgress()
    const nivel  = result.success ? result.progress.nivel : 1

    if (nivel <= 2) return true
    if (nivel <= 4) return Math.random() < 0.33
    const nutrientes = plant.nutrientes ?? 50
    return plant.estado_planta === 'MARCHITA' ||
      plant.estado_planta === 'ENFERMA' ||
      this._hasWrongLight(plant) ||
      nutrientes < 30 ||
      nutrientes > 75
  },

  _selectScenario(plant, actionType) {
    const { estado_planta, humedad } = plant
    const nutrientes = plant.nutrientes ?? 50

    if (estado_planta === 'MUERTA')   return this._scenarios.MUERTA

    if ((actionType === 'water' || actionType === 'drain') && this._hasWrongLight(plant)) {
      return this._scenarios.WATER_LUZ_INCORRECTA
    }

    if (actionType === 'fertilize') {
      if (nutrientes > 75) return this._scenarios.FERTILIZE_NUTRIENTES_EXCESO
      if (nutrientes < 30) return this._scenarios.FERTILIZE_NUTRIENTES_BAJOS
    }

    if (actionType === 'prune') {
      return plant.requiere_poda_activa === 1
        ? this._scenarios.PRUNE_NECESARIA
        : this._scenarios.PRUNE_NO_NECESARIA
    }

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

    if (humedad > 75) return this._scenarios.SANA_EXCESO_AGUA
    if (humedad < 40) return this._scenarios.SANA_NECESITA_AGUA
    return this._scenarios.SANA
  },

  _roomLights: {
    'SALA': 'INDIRECTA',
    'JARDIN': 'DIRECTA',
    'JARDÍN': 'DIRECTA',
    'DORMITORIO': 'INDIRECTA'
  },

  _roomLight(ubicacion) {
    return this._roomLights[ubicacion] || null
  },

  _isLightCompatible(requiredLight, roomLight) {
    if (!requiredLight || !roomLight) return true
    if (requiredLight === roomLight) return true
    return requiredLight === 'SOMBRA' && roomLight === 'INDIRECTA'
  },

  _hasWrongLight(plant) {
    const roomLight = this._roomLight(plant.ubicacion)
    return roomLight !== null && !this._isLightCompatible(plant.tipo_luz, roomLight)
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

    const state =
      humedad < 20  ? 'seca'      :
      humedad < 40  ? 'baja'      :
      humedad <= 75 ? 'adecuada'  :
      humedad <= 90 ? 'alta'      :
                      'saturada'

    return `
      <div class="diag-bar-row">
        <span class="diag-bar-label">${label}</span>
        <div class="diag-bar-bg">
          <div class="diag-bar-fill ${colorClass}"
               style="width: ${humedad}%"></div>
        </div>
        <span class="diag-bar-val">${state}</span>
      </div>
    `
  },

  _getHealthState(salud) {
    if (salud <= 25) return 'crítica'
    if (salud <= 50) return 'delicada'
    if (salud <= 75) return 'estable'
    return 'saludable'
  },

  async run(plant, actionType) {
    const shouldShow = await this._shouldShowDiagnosis(plant)
    if (!shouldShow) return true

    return new Promise((resolve) => {
      const scenario    = this._selectScenario(plant, actionType)
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
                  <span class="diag-bar-val">${this._getHealthState(plant.salud)}</span>
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
            resultTextEl.textContent = 'Correcto. Aplicaste drenaje antes de regar.'
          } else {
            resultTextEl.textContent = answeredCorrectly
              ? 'Correcto. Observaste bien las señales.'
              : 'No era la causa principal. Revisa las señales de la planta.'
          }

          if (diagResult.streakEvent?.changed) {
            resultTextEl.textContent += ` ${diagResult.streakEvent.message}.`
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
