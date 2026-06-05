// CareActions: coordina el flujo completo de una acción de cuidado.
//
// Flujo estándar (RF-31 / LM4):
//   1. Validación previa (solo para poda)
//   2. Diagnosis.run()  → selección múltiple obligatoria
//   3. Acción en BD     → waterPlant / fertilizePlant / prunePlant
//   4. Feedback visual  → toast educativo
//   5. Guía contextual  → si el error se repite más de 5 veces (RF-29)
//   6. Evento xp:gained → PlayerHUD se actualiza sin acoplamiento

const CareActions = {

  // Rastrea qué guías ya se mostraron en esta sesión.
  // Evita mostrar la misma guía múltiples veces seguidas.
  _guidesShownThisSession: new Set(),

  init() { },

  async water(plant, onComplete) {
    const canProceed = await Diagnosis.run(plant, 'water')

    // ✅ 'drained' = el diagnóstico ya ejecutó el drenaje, no regar
    if (!canProceed || canProceed === 'drained') {
      if (canProceed === 'drained') {
        // Recarga el entorno para mostrar la humedad actualizada
        if (onComplete) onComplete({ success: true, isError: false })
      }
      return
    }

    const result = await window.gameAPI.waterPlant(plant.id_registro)
    await this._handleResult(result, onComplete, 'riego')
  },

  // Drenar exceso de agua — disponible cuando la tierra está saturada.
  /*async drain(plant, onComplete) {
    if (plant.humedad <= 75) {
      this._showToast(
        `${plant.nombre_planta} no tiene exceso de agua. Drena solo cuando la tierra esté saturada.`,
        'warning'
      )
      return
    }

    const canProceed = await Diagnosis.run(plant, 'drain')
    if (!canProceed) return

    const result = await window.gameAPI.drainPlant(plant.id_registro)
    await this._handleResult(result, onComplete, 'riego')
  },  */

  async fertilize(plant, onComplete) {
    const canProceed = await Diagnosis.run(plant, 'fertilize')
    if (!canProceed) return

    const result = await window.gameAPI.fertilizePlant(plant.id_registro)
    await this._handleResult(result, onComplete, 'abono')
  },

  async prune(plant, onComplete) {
    const progressResult = await window.gameAPI.getProgress()
    if (progressResult.success && progressResult.progress.nivel < 2) {
      this._showToast('🔒 La herramienta de poda se desbloquea al alcanzar el nivel 2.', 'warning')
      return
    }

    if (plant.tipo_poda === 'NUNCA') {
      this._showToast(`❌ ${plant.nombre_planta} no requiere poda. Podarla puede dañarla.`, 'warning')
      return
    }

    if (!plant.requiere_poda_activa) {
      this._showToast(`⚠️ ${plant.nombre_planta} no necesita poda ahora.`, 'warning')
      return
    }

    const canProceed = await Diagnosis.run(plant, 'prune')
    if (!canProceed) return

    const result = await window.gameAPI.prunePlant(plant.id_registro)
    await this._handleResult(result, onComplete, 'poda')
  },

  // Procesa el resultado e incluye verificación de guía contextual (RF-29)
  async _handleResult(result, onComplete, errorType) {
    if (!result.success) {
      this._showToast(result.error, 'error')
      return
    }

    const toastType = result.isError ? 'warning' : 'success'
    this._showToast(result.feedback, toastType)
    if (result.streakEvent?.changed) {
      setTimeout(() => this._showToast(result.streakEvent.message, 'success'), 1300)
    }

    if (result.xpResult) {
      window.dispatchEvent(new CustomEvent('xp:gained', {
        detail: result.xpResult
      }))
    }

    // ✅ RF-29: verifica si debe mostrarse guía contextual por errores repetidos
    if (result.isError && errorType) {
      await this._checkContextualGuide(errorType)
    }

    if (onComplete) onComplete(result)

    window.dispatchEvent(new CustomEvent('tutorial:care-action:completed', {
      detail: { errorType, result }
    }))
  },

  // Verifica si el contador de errores supera el umbral (5 errores).
  // Solo muestra la guía una vez por tipo por sesión.
  // Snapshot de contadores cuando se mostró la guía por última vez.
  // Permite calcular errores nuevos desde entonces, no el total histórico.
  _errorCountsAtLastGuide: {
    riego: null,
    abono: null,
    poda: null,
    ubicacion: null,
    drenaje: null
  },

  async _checkContextualGuide(errorType) {
    if (this._guidesShownThisSession.has(errorType)) return

    const statsResult = await window.gameAPI.getStats()
    if (!statsResult.success) return

    const stats = statsResult.stats
    const totalErrors = {
      riego: stats.errores_riego,
      abono: stats.errores_abono,
      poda: stats.errores_poda,
      ubicacion: stats.errores_ubicacion
    }[errorType] || 0

    // Si es la primera vez que revisamos este tipo en esta sesión,
    // guardamos el valor actual como punto de partida
    if (this._errorCountsAtLastGuide[errorType] === null) {
      this._errorCountsAtLastGuide[errorType] = totalErrors - 1
      // -1 porque el error que acaba de ocurrir ya está sumado
    }

    // Errores cometidos DESDE que arrancó la sesión (o desde la última guía)
    const errorsThisSession =
      totalErrors - this._errorCountsAtLastGuide[errorType]

    if (errorsThisSession > 5) {
      setTimeout(() => {
        this._showGuideHint(errorType)
        this._showContextualGuide(errorType)
        this._guidesShownThisSession.add(errorType)
        // Actualiza el snapshot para el siguiente ciclo
        this._errorCountsAtLastGuide[errorType] = totalErrors
      }, 2000)
    }
  },

  _showGuideHint(errorType) {
    const hint = CareMessagesConfig.guideHints[errorType]
    if (!hint || !window.Guide) return

    Guide.show({
      title: 'Pista de cuidado',
      mood: hint.mood,
      message: hint.message,
      cooldownKey: `care-${errorType}`,
      cooldownMs: 90000
    })
  },

  // Muestra el modal de guía contextual educativa (RF-28)
  _showContextualGuide(errorType) {
    const guide = CareMessagesConfig.contextualGuides[errorType]
    if (!guide) return

    const overlay = document.createElement('div')
    overlay.className = 'diagnosis-overlay'
    overlay.innerHTML = CareGuideDisplayUtils.getContextualGuideHTML(guide)

    document.body.appendChild(overlay)
    overlay.querySelector('#btn-close-guide')
      .addEventListener('click', () => overlay.remove())
  },

  _showToast(message, type = 'info') {
    const existing = document.querySelector('.care-toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.className = `care-toast care-toast-${type}`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => toast.classList.add('visible'), 50)
    setTimeout(() => {
      toast.classList.remove('visible')
      setTimeout(() => toast.remove(), 400)
    }, 4000)
  }

}

window.CareActions = CareActions
