const WeeklyReview = {

  _actions: [],
  _currentWeek: 0,
  _running: false,   // ✅ evita ejecuciones simultáneas

  async checkAndRun(currentDay) {
    // ✅ Si ya hay una revisión activa, ignorar llamadas adicionales
    if (this._running) return false

    const checkResult = await window.gameAPI.shouldTriggerWeekly(currentDay)
    if (!checkResult.success || !checkResult.should) return false

    const actionsResult = await window.gameAPI.getTopActions()
    if (!actionsResult.success) return false

    this._actions = actionsResult.actions
    this._currentWeek = Math.floor(currentDay / 7)

    this._running = true   // ✅ bloquea nuevas ejecuciones

    return new Promise((resolve) => {
      this._showReview((result) => {
        this._running = false   // ✅ libera al cerrar el modal
        resolve(result)
      })
    })
  },

  _showReview(resolve) {
    const totalErrors = this._actions.reduce((sum, action) => sum + action.errorCount, 0)
    if (totalErrors === 0) {
      this._showPerfectWeek(resolve)
      return
    }

    const mostHarmfulIndex = this._actions.reduce(
      (maxI, a, i, arr) => a.errorCount > arr[maxI].errorCount ? i : maxI,
      0
    )
    const getFrequencyLabel = (index) => {
      if (index === 0) return 'Más frecuente'
      if (index === 1) return 'Frecuente'
      return 'Ocasional'
    }

    const overlay = document.createElement('div')
    overlay.id        = 'weekly-overlay'
    overlay.className = 'minigame-overlay'

    overlay.innerHTML = `
      <div class="minigame-container weekly-container">

        <div class="weekly-header">
          <span class="weekly-icon">📊</span>
          <h2 class="weekly-title">Revisión semanal</h2>
          <p class="weekly-subtitle">
            Completa esta revisión para continuar jugando.
            Observa tus patrones de cuidado y elige cuál afectó más a tus plantas.
          </p>
        </div>

        <div class="weekly-actions-summary">
          <p class="weekly-section-label">Patrones de cuidado observados esta semana:</p>
          <div class="weekly-actions-list">
            ${this._actions.map((action, i) => `
              <div class="weekly-action-item">
                <span class="weekly-action-num">${i + 1}</span>
                <div class="weekly-action-info">
                  <span class="weekly-action-label">${action.label}</span>
                  <div class="weekly-action-bar-bg">
                    <div class="weekly-action-bar-fill"
                         style="width: ${Math.min(100, action.errorCount * 20)}%">
                    </div>
                  </div>
                  <span class="weekly-action-count">${getFrequencyLabel(i)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="weekly-question">
          <p class="weekly-q-text">
            ¿Cuál de estas decisiones crees que fue la más perjudicial para tus plantas?
          </p>
          <div class="weekly-options" id="weekly-options">
            ${this._actions.map((action, i) => `
              <button class="weekly-option-btn" data-index="${i}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="weekly-result hidden" id="weekly-result"></div>

      </div>
    `

    document.body.appendChild(overlay)

    overlay.querySelectorAll('.weekly-option-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const selectedIndex = parseInt(btn.dataset.index)
        const isCorrect     = selectedIndex === mostHarmfulIndex

        overlay.querySelectorAll('.weekly-option-btn').forEach(b => {
          b.disabled = true
          b.classList.add('disabled')
        })

        overlay.querySelectorAll('.weekly-option-btn')[mostHarmfulIndex]
          .classList.add('correct')
        if (!isCorrect) btn.classList.add('incorrect')

        const result = await window.gameAPI.submitWeeklyReview(isCorrect, this._currentWeek)

        if (result.xpResult) {
          window.dispatchEvent(new CustomEvent('xp:gained', {
            detail: result.xpResult
          }))
        }

        const mostHarmful = this._actions[mostHarmfulIndex]
        const selected    = this._actions[selectedIndex]

        const resultEl = overlay.querySelector('#weekly-result')
        resultEl.className = 'weekly-result'
        resultEl.innerHTML = `
          <div class="weekly-result-content ${isCorrect ? 'correct' : 'incorrect'}">
            <p class="weekly-result-title">
              ${isCorrect
                ? 'Evaluación correcta. Identificaste el patrón principal.'
                : 'No era la más perjudicial. Revisa el patrón principal.'}
            </p>
            ${!isCorrect ? `
              <p class="weekly-compare">
                Elegiste: <strong>${selected.label}</strong><br>
                El patrón principal fue: <strong>${mostHarmful.label}</strong>
              </p>
            ` : ''}
            <p class="weekly-explanation">💡 ${mostHarmful.explanation}</p>
            <p class="weekly-advice">
              La próxima semana observa con más cuidado:
              <strong>${mostHarmful.label}</strong>
            </p>
          </div>
          <button class="btn btn-primary weekly-continue-btn" id="btn-weekly-done">
            Continuar jugando →
          </button>
        `
        resultEl.classList.remove('hidden')

        overlay.querySelector('#btn-weekly-done')
          .addEventListener('click', () => {
            overlay.remove()
            resolve(isCorrect)
          })
      })
    })
  },

  _showPerfectWeek(resolve) {
    const overlay = document.createElement('div')
    overlay.id        = 'weekly-overlay'
    overlay.className = 'minigame-overlay'

    overlay.innerHTML = `
      <div class="minigame-container weekly-container">
        <div class="weekly-header">
          <span class="weekly-icon">✓</span>
          <h2 class="weekly-title">Semana sin errores</h2>
          <p class="weekly-subtitle">
            Completaste esta semana sin registrar errores de riego, abono, poda o ubicación.
          </p>
        </div>

        <div class="weekly-result">
          <div class="weekly-result-content correct">
            <p class="weekly-result-title">
              Buen trabajo. Tus decisiones de cuidado fueron consistentes.
            </p>
            <p class="weekly-explanation">
              Mantener humedad, nutrientes, luz y poda bajo control ayuda a que tus plantas se recuperen con estabilidad.
            </p>
            <p class="weekly-advice">
              La próxima semana sigue observando antes de actuar, especialmente cuando cambies una planta de lugar.
            </p>
          </div>
          <button class="btn btn-primary weekly-continue-btn" id="btn-weekly-done">
            Continuar jugando →
          </button>
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    overlay.querySelector('#btn-weekly-done')
      .addEventListener('click', async () => {
        const result = await window.gameAPI.submitWeeklyReview(true, this._currentWeek)
        if (result.xpResult) {
          window.dispatchEvent(new CustomEvent('xp:gained', {
            detail: result.xpResult
          }))
        }
        overlay.remove()
        resolve(true)
      })
  }

}

window.WeeklyReview = WeeklyReview
