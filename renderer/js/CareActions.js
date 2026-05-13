// CareActions: coordina el flujo completo de una acción de cuidado.
//
// Flujo estándar (RF-31 / LM4):
//   1. Validación previa (solo para poda)
//   2. Diagnosis.run()  → selección múltiple obligatoria
//   3. Acción en BD     → waterPlant / fertilizePlant / prunePlant
//   4. Feedback visual  → toast educativo
//   5. Evento xp:gained → PlayerHUD se actualiza sin acoplamiento

const CareActions = {

  // Sin _userId: el juego no tiene autenticación.
  // Las acciones de cuidado solo necesitan id_registro.

  init() {
    // Punto de inicialización reservado para configuración futura.
    // Por ahora no requiere parámetros.
  },

  // RF-07: Regar una planta.
  async water(plant, onComplete) {
    const canProceed = await Diagnosis.run(plant, 'water')
    if (!canProceed) return

    const result = await window.gameAPI.waterPlant(plant.id_registro)
    this._handleResult(result, onComplete)
  },

  // RF-08: Aplicar abono a una planta.
  async fertilize(plant, onComplete) {
    const canProceed = await Diagnosis.run(plant, 'fertilize')
    if (!canProceed) return

    const result = await window.gameAPI.fertilizePlant(plant.id_registro)
    this._handleResult(result, onComplete)
  },

  // RF-09: Podar una planta.
  // La validación ocurre ANTES del diagnóstico para no activar
  // la mecánica LM4 en una acción que ya sabemos que es inválida.
  async prune(plant, onComplete) {
    // Bloqueo 1: nivel insuficiente
    const progressResult = await window.gameAPI.getProgress()
    if (progressResult.success && progressResult.progress.nivel < 2) {
      this._showToast('🔒 La herramienta de poda se desbloquea al alcanzar el nivel 2.', 'warning')
      return
    }

    // Bloqueo 2: esta planta nunca se poda
    if (plant.tipo_poda === 'NUNCA') {
      this._showToast(`❌ ${plant.nombre_planta} no requiere poda. Podarla puede dañarla.`, 'warning')
      return
    }

    // Bloqueo 3: la planta no necesita poda en este momento
    if (!plant.requiere_poda_activa) {
      this._showToast(`⚠️ ${plant.nombre_planta} no necesita poda ahora.`, 'warning')
      return
    }

    // Solo llega al diagnóstico si la poda es válida
    const canProceed = await Diagnosis.run(plant, 'prune')
    if (!canProceed) return

    const result = await window.gameAPI.prunePlant(plant.id_registro)
    this._handleResult(result, onComplete)
  },

  // Procesa el resultado de cualquier acción de cuidado.
  // Muestra feedback educativo y emite evento de XP si corresponde.
  _handleResult(result, onComplete) {
    if (!result.success) {
      this._showToast(result.error, 'error')
      return
    }

    const toastType = result.isError ? 'warning' : 'success'
    this._showToast(result.feedback, toastType)

    // Notifica al HUD sin acoplamiento directo (escuchado en index.js)
    if (result.xpResult) {
      window.dispatchEvent(new CustomEvent('xp:gained', {   // ✅ window, no document
        detail: result.xpResult
      }))
    }

    if (onComplete) onComplete(result)
  },

  // Toast: mensaje flotante educativo que aparece y desaparece.
  // type: 'success' | 'warning' | 'error' | 'info'
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