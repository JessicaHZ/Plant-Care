document.addEventListener('DOMContentLoaded', async () => {

  // ✅ Inicia en la pantalla de splash
  ScreenManager.init()

  // ── Pantalla de inicio ────────────────────────────────────────────────
  // ── Inicialización global ─────────────────────────────────────────────
  // Sin autenticación: el juego inicia directamente en el menú principal.
  // Todos los módulos se inicializan con el progreso local del jugador.

  const progressResult = await window.gameAPI.getProgress()
  const progress = progressResult.success ? progressResult.progress : { nivel: 1, experiencia: 0, racha_dias: 0 }

  const plantsResult = await window.gameAPI.getUserPlants()
  const plantCount = plantsResult.success ? plantsResult.plants.length : 0

  // Habilita "Continuar" solo si el jugador tiene plantas o progreso real
  const hasProgress = progress.experiencia > 0 || plantCount > 0
  const continueBtn = document.getElementById('btn-continue-game')
  if (continueBtn) continueBtn.disabled = !hasProgress

  document.getElementById('btn-continue-game').addEventListener('click', async () => {
    await _enterGame()
  })

  document.getElementById('btn-new-game').addEventListener('click', async () => {
    // Confirma antes de borrar si hay partida existente
    if (hasProgress) {
      const confirmed = await _showNewGameConfirm()
      if (!confirmed) return
    }
    await window.gameAPI.resetGame()
    await _enterGame(true)  // true = forzar tutorial
  })

  // Versión de Electron en pantalla
  const versionLabel = document.getElementById('version-label')
  if (versionLabel) {
    versionLabel.textContent = `Electron v${window.gameAPI.getVersion()}`
  }

  // ── Módulos del juego ─────────────────────────────────────────────────
  // Se inicializan una sola vez al cargar el DOM.

  // ── Eventos globales del juego ────────────────────────────────────────
  // Registrados una sola vez aquí para evitar listeners duplicados.

  // Actualiza el HUD cada vez que el jugador gana XP
  window.addEventListener('xp:gained', async () => {
    const result = await window.gameAPI.getProgress()
    if (result.success) {
      PlayerHUD.update(result.progress, plantCount)
    }
  })

  // Verifica si debe activarse la revisión semanal tras avanzar días
  window.addEventListener('simulation:tick', async ({ detail }) => {
    // ✅ Recarga el progreso para reflejar la racha actualizada
    const result = await window.gameAPI.getProgress()
    if (result.success) {
      const plantsResult = await window.gameAPI.getUserPlants()
      const count = plantsResult.success ? plantsResult.plants.length : 0
      PlayerHUD.update(result.progress, count)
    }
    await WeeklyReview.checkAndRun(detail.day)
  })

  // Actualiza el contador de plantas en el HUD al adquirir una
  window.addEventListener('plant:acquired', async () => {
    const result = await window.gameAPI.getUserPlants()
    if (result.success) {
      PlayerHUD.update(progress, result.plants.length)
    }
  })

  // ════════════════════════════════════════════════════════
  // MENÚ PRINCIPAL
  // ════════════════════════════════════════════════════════

  document.getElementById('btn-go-nursery').addEventListener('click', async () => {
    ScreenManager.show('nursery')
    await Nursery.init()
  })

  document.getElementById('btn-go-environment').addEventListener('click', async () => {
    ScreenManager.show('environment')
    await Environment.init()
  })

  document.getElementById('btn-go-minigames').addEventListener('click', () => {
    ScreenManager.show('minigames')
  })

  document.getElementById('btn-go-profile').addEventListener('click', async () => {
    ScreenManager.show('profile')
    await ProfileScreen.init()
  })

  document.getElementById('btn-profile-back').addEventListener('click', () => {
    ScreenManager.show('main-menu')
  })

  // ════════════════════════════════════════════════════════
  // NAVEGACIÓN — BOTONES DE RETORNO
  // ════════════════════════════════════════════════════════

  document.getElementById('btn-nursery-back').addEventListener('click', () => {
    ScreenManager.show('main-menu')
  })

  document.getElementById('btn-env-back').addEventListener('click', () => {
    ScreenManager.show('main-menu')
  })

  document.getElementById('btn-minigames-back').addEventListener('click', () => {
    ScreenManager.show('main-menu')
  })

  // ════════════════════════════════════════════════════════
  // MINIJUEGOS
  // ════════════════════════════════════════════════════════

  document.getElementById('btn-start-pests').addEventListener('click', () => {
    MiniGamePests.start((correct) => {
      console.log(`Plagas: ${correct ? 'correcto' : 'incorrecto'}`)
    })
  })

  document.getElementById('btn-start-quiz').addEventListener('click', () => {
    MiniGameQuiz.start((correctCount) => {
      console.log(`Quiz: ${correctCount} correctas`)
    })
  })


  // Procesa los días offline y muestra el mensaje de bienvenida
  async function _processOfflineDays(days) {
    // Avanza la simulación los días transcurridos
    const result = await window.gameAPI.advanceDays(days)

    // Actualiza el día en pantalla
    if (result.success) {
      Simulation._currentDay += days
      Simulation._updateDayDisplay()
    }

    // Detecta plantas que necesitan atención
    const plantsResult = await window.gameAPI.getUserPlants()
    const needsAttention = plantsResult.success
      ? plantsResult.plants.filter(p =>
        p.estado_planta === 'MARCHITA' ||
        p.estado_planta === 'ENFERMA'
      )
      : []

    // Muestra mensaje de bienvenida
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

  // Entra al juego: navega al menú, procesa offline y muestra tutorial si aplica
  async function _enterGame(forceTutorial = false) {
    // ✅ Inicializa módulos del juego
    PlayerHUD.init()
    CareActions.init()
    await Simulation.init()

    // ✅ Recarga el progreso desde BD — puede haber cambiado si fue reset
    const freshProgress = await window.gameAPI.getProgress()
    const freshPlants = await window.gameAPI.getUserPlants()
    const freshCount = freshPlants.success ? freshPlants.plants.length : 0
    const fp = freshProgress.success
      ? freshProgress.progress
      : { nivel: 1, experiencia: 0, racha_dias: 0 }

    PlayerHUD.update(fp, freshCount)

    ScreenManager.show('main-menu')

    // Procesa tiempo offline
    const offlineResult = await window.gameAPI.getOfflineDays()
    if (offlineResult.success && offlineResult.days > 0) {
      await _processOfflineDays(offlineResult.days)
    }

    // ✅ Resetea tutorial ANTES de checkAndStart para que lo detecte correctamente
    if (forceTutorial) {
      await window.gameAPI.resetTutorial()
    }

    // Pequeña pausa para garantizar que el reset se persistió en BD
    await new Promise(resolve => setTimeout(resolve, 100))

    await Tutorial.checkAndStart()
  }

  // Modal de confirmación antes de borrar la partida actual
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