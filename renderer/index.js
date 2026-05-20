document.addEventListener('DOMContentLoaded', async () => {

  // ✅ Muestra splash inmediatamente
  ScreenManager.init()

  // ── Carga datos iniciales en paralelo ─────────────────────────────────
  const [progressResult, plantsResult] = await Promise.all([
    window.gameAPI.getProgress(),
    window.gameAPI.getUserPlants()
  ])

  const progress   = progressResult.success
    ? progressResult.progress
    : { nivel: 1, experiencia: 0, racha_dias: 0 }
  const plantCount = plantsResult.success ? plantsResult.plants.length : 0

  // Versión de Electron
  const versionLabel = document.getElementById('version-label')
  if (versionLabel) {
    versionLabel.textContent = `Electron v${window.gameAPI.getVersion()}`
  }

  // ── Pantalla de inicio ────────────────────────────────────────────────
  const hasProgress = progress.experiencia > 0 || plantCount > 0
  const continueBtn = document.getElementById('btn-continue-game')
  if (continueBtn) continueBtn.disabled = !hasProgress

  document.getElementById('btn-continue-game').addEventListener('click', async () => {
    await _enterGame()
  })

  document.getElementById('btn-new-game').addEventListener('click', async () => {
    if (hasProgress) {
      const confirmed = await _showNewGameConfirm()
      if (!confirmed) return
    }
    await window.gameAPI.resetGame()
    await _enterGame(true)
  })

  // ── Navegación inferior ───────────────────────────────────────────────
  initBottomNav()

  // ── Eventos globales ──────────────────────────────────────────────────

  window.addEventListener('xp:gained', async () => {
    const result = await window.gameAPI.getProgress()
    if (result.success) {
      const pr = await window.gameAPI.getUserPlants()
      const count = pr.success ? pr.plants.length : 0
      PlayerHUD.update(result.progress, count)
    }
  })

  window.addEventListener('simulation:tick', async ({ detail }) => {
    const result = await window.gameAPI.getProgress()
    if (result.success) {
      const pr = await window.gameAPI.getUserPlants()
      const count = pr.success ? pr.plants.length : 0
      PlayerHUD.update(result.progress, count)
    }
    await WeeklyReview.checkAndRun(detail.day)
  })

  window.addEventListener('plant:acquired', async () => {
    const result = await window.gameAPI.getUserPlants()
    if (result.success) {
      const pr = await window.gameAPI.getProgress()
      const fp = pr.success ? pr.progress : progress
      PlayerHUD.update(fp, result.plants.length)
    }
  })

  // ── Minijuegos ────────────────────────────────────────────────────────

  document.getElementById('btn-start-pests').addEventListener('click', () => {
    MiniGameDefense.start((summary) => {
      console.log(`Defensa del brote: ${summary.xpGained} XP`)
    })
  })

  document.getElementById('btn-start-quiz').addEventListener('click', () => {
    MiniGameQuiz.start((correctCount) => {
      console.log(`Quiz: ${correctCount} correctas`)
    })
  })

  // ── Funciones internas ────────────────────────────────────────────────

  document.getElementById('btn-start-pruning').addEventListener('click', () => {
    MiniGamePruning.startPractice((result) => {
      console.log(`Poda practica: ${result.accuracy}% de precision`)
    })
  })

  function initBottomNav() {
    const nav = document.getElementById('bottom-nav')
    if (!nav) return

    nav.addEventListener('click', async (e) => {
      const btn = e.target.closest('.nav-btn')
      if (!btn) return

      const screen = btn.dataset.screen
      if (!screen) return

      nav.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      switch (screen) {
        case 'environment':
          ScreenManager.show('environment')
          await Environment.init()
          break
        case 'nursery':
          ScreenManager.show('nursery')
          await Nursery.init()
          break
        case 'minigames':
          ScreenManager.show('minigames')
          break
        case 'profile':
          ScreenManager.show('profile')
          await ProfileScreen.init()
          break
      }
    })
  }

  function showBottomNav() {
    document.getElementById('bottom-nav')?.classList.remove('hidden')
  }

  async function _enterGame(forceTutorial = false) {
    // Fase 1 — inmediata
    ScreenManager.show('environment')
    showBottomNav()
    PlayerHUD.init()
    CareActions.init()

    // Fase 2 — en paralelo
    const [freshProgress, freshPlants, offlineResult] = await Promise.all([
      window.gameAPI.getProgress(),
      window.gameAPI.getUserPlants(),
      window.gameAPI.getOfflineDays()
    ])

    const freshCount = freshPlants.success ? freshPlants.plants.length : 0
    const fp = freshProgress.success
      ? freshProgress.progress
      : { nivel: 1, experiencia: 0, racha_dias: 0 }

    PlayerHUD.update(fp, freshCount)

    await Promise.all([
      Simulation.init(),
      Environment.init()
    ])

    if (offlineResult.success && offlineResult.days > 0) {
      await _processOfflineDays(offlineResult.days)
    }

    if (forceTutorial) {
      await window.gameAPI.resetTutorial()
    }
    await new Promise(resolve => setTimeout(resolve, 100))
    await Tutorial.checkAndStart()
  }

  async function _processOfflineDays(days) {
    const result = await window.gameAPI.advanceDays(days)

    if (result.success) {
      Simulation._currentDay += days
      Simulation._updateDayDisplay()
    }

    const pr = await window.gameAPI.getUserPlants()
    const needsAttention = pr.success
      ? pr.plants.filter(p =>
          p.estado_planta === 'MARCHITA' ||
          p.estado_planta === 'ENFERMA'
        )
      : []

    _showOfflineMessage(days, needsAttention)
  }

  function _showOfflineMessage(days, plantsNeedingAttention) {
    const overlay = document.createElement('div')
    overlay.className = 'diagnosis-overlay'

    const plantWarning = plantsNeedingAttention.length > 0
      ? `<p style="color:#ffa726; margin-top:0.75rem">
          ⚠️ ${plantsNeedingAttention.length} planta${plantsNeedingAttention.length > 1 ? 's necesitan' : ' necesita'} atención:
          ${plantsNeedingAttention.map(p => p.nombre_planta).join(', ')}
         </p>`
      : `<p style="color:#66bb6a; margin-top:0.75rem">✅ Tus plantas están bien por ahora.</p>`

    overlay.innerHTML = `
      <div class="diagnosis-modal">
        <div class="diagnosis-header">
          <span class="diagnosis-icon">🌿</span>
          <h2 class="diagnosis-title">¡Bienvenido de vuelta!</h2>
        </div>
        <p style="text-align:center; color:var(--color-text); line-height:1.6; margin-top:1rem">
          Han pasado <strong>${days} día${days > 1 ? 's' : ''}</strong>
          desde tu última visita.
        </p>
        ${plantWarning}
        <button class="btn btn-primary btn-full" id="btn-close-offline"
                style="margin-top:1.5rem">
          Ver mis plantas →
        </button>
      </div>
    `

    document.body.appendChild(overlay)
    overlay.querySelector('#btn-close-offline')
      .addEventListener('click', () => overlay.remove())
  }

  function _showNewGameConfirm() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div')
      overlay.className = 'diagnosis-overlay'
      overlay.innerHTML = `
        <div class="diagnosis-modal">
          <div class="diagnosis-header">
            <span class="diagnosis-icon">⚠️</span>
            <h2 class="diagnosis-title">¿Nueva partida?</h2>
          </div>
          <p style="text-align:center; color:var(--color-text); line-height:1.6; margin-top:1rem">
            Esto eliminará <strong>todo tu progreso actual</strong>:
            plantas, nivel, XP y logros.
            <br><br>
            Esta acción no se puede deshacer.
          </p>
          <div style="display:flex; gap:1rem; margin-top:1.5rem">
            <button class="btn btn-ghost btn-full" id="btn-confirm-cancel">
              Cancelar
            </button>
            <button class="btn btn-primary btn-full" id="btn-confirm-new"
                    style="background:#ef5350; border-color:#ef5350">
              Sí, empezar de nuevo
            </button>
          </div>
        </div>
      `
      document.body.appendChild(overlay)

      overlay.querySelector('#btn-confirm-cancel')
        .addEventListener('click', () => {
          overlay.remove()
          resolve(false)
        })

      overlay.querySelector('#btn-confirm-new')
        .addEventListener('click', () => {
          overlay.remove()
          resolve(true)
        })
    })
  }

})
