const WeeklyReview = {

  _actions: [],
  _running: false,   // ✅ evita ejecuciones simultáneas

  async checkAndRun(currentDay) {
    // ✅ Si ya hay una revisión activa, ignorar llamadas adicionales
    if (this._running) return false

    const checkResult = await window.gameAPI.shouldTriggerWeekly(currentDay)
    if (!checkResult.success || !checkResult.should) return false

    const actionsResult = await window.gameAPI.getTopActions()
    if (!actionsResult.success) return false

    this._actions = actionsResult.actions

    this._running = true   // ✅ bloquea nuevas ejecuciones

    return new Promise((resolve) => {
      this._showReview((result) => {
        this._running = false   // ✅ libera al cerrar el modal
        resolve(result)
      })
    })
  },

  _showReview(resolve) {
    const mostHarmfulIndex = this._actions.reduce(
      (maxI, a, i, arr) => a.errorCount > arr[maxI].errorCount ? i : maxI,
      0
    )

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
            Analiza tus acciones de esta semana y evalúa cuál fue la más perjudicial.
          </p>
        </div>

        <div class="weekly-actions-summary">
          <p class="weekly-section-label">Tus 3 acciones con más errores esta semana:</p>
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
                  <span class="weekly-action-count">${action.errorCount} errores</span>
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

        const result = await window.gameAPI.submitWeeklyReview(isCorrect)

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
                ? `✅ ¡Evaluación correcta! +${result.xpGained} XP`
                : '❌ No era esa la más perjudicial'}
            </p>
            ${!isCorrect ? `
              <p class="weekly-compare">
                Elegiste: <strong>${selected.label}</strong> (${selected.errorCount} errores)<br>
                La más perjudicial fue: <strong>${mostHarmful.label}</strong> (${mostHarmful.errorCount} errores)
              </p>
            ` : ''}
            <p class="weekly-explanation">💡 ${mostHarmful.explanation}</p>
            <p class="weekly-advice">
              La próxima semana presta especial atención a:
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
  }

}

window.WeeklyReview = WeeklyReview