const Diagnosis = {

  async _shouldShowDiagnosis(plant) {
    const result = await window.gameAPI.getProgress()
    const nivel  = result.success ? result.progress.nivel : 1

    return DiagnosisRules.shouldShowDiagnosis({
      plant,
      level: nivel
    })
  },

  async run(plant, actionType) {
    const shouldShow = await this._shouldShowDiagnosis(plant)
    if (!shouldShow) return true

    return new Promise((resolve) => {
      const scenario    = DiagnosisScenarioSelector.selectScenario({
        scenarios: DiagnosisConfig.scenarios,
        plant,
        actionType
      })
      let drainExecuted = false   // ✅ variable local, no en el objeto escenario

      const overlay = document.createElement('div')
      overlay.className = 'diagnosis-overlay'

      overlay.innerHTML = `
        <div class="diagnosis-modal">
          <div class="diagnosis-header">
            <span class="diagnosis-icon">🔍</span>
            <h2 class="diagnosis-title">Diagnóstico previo</h2>
            <p class="diagnosis-subtitle">
              Antes de <strong>${DiagnosisConfig.getActionLabel(actionType)}</strong>,
              analiza el estado de tu planta
            </p>
          </div>

          <div class="diagnosis-plant-state">
            <img
              class="diagnosis-plant-img"
              src="${CareDisplayUtils.getPlantSpritePath(plant.sprite_key, plant.estado_planta)}"
              onerror="this.onerror=null; this.src='${CareDisplayUtils.getLegacyPlantSpritePath(plant.sprite_key, plant.estado_planta)}'"
              alt="${plant.nombre_planta}"
            />
            <div class="diagnosis-situation">
              <p class="diagnosis-plant-name">${plant.nombre_planta}</p>
              <p class="diagnosis-situation-text">${scenario.situation}</p>
              <div class="diagnosis-bars">
                ${DiagnosisDisplayUtils.getHumidityBarHTML(plant.humedad)}
                ${DiagnosisDisplayUtils.getHealthBarHTML(plant.salud)}
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

          resultTextEl.textContent = DiagnosisDisplayUtils.getResultText({
            answeredCorrectly,
            requiresDrain: scenario.onCorrect === 'drain',
            streakEvent: diagResult.streakEvent
          })

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
