// Tutorial: guia inicial basada en acciones reales del jugador.
// Mantiene el flujo simple: mensajes breves, highlights y eventos de progreso.

const Tutorial = {
  _currentStep: 0,
  _active: false,
  _listeners: [],

  _steps: [
    {
      mood: 'happy',
      message: 'Hola. Te acompañare mientras preparas tu primera planta.',
      actionLabel: 'Comenzar',
      next: 'manual'
    },
    {
      mood: 'thinking',
      message: 'Abre el Vivero. Ahi puedes elegir plantas reales para cuidar.',
      anchorId: 'nav-btn-nursery',
      waitFor: 'tutorial:screen:nursery'
    },
    {
      mood: 'thinking',
      message: 'Selecciona una planta. Mira su ficha antes de decidir.',
      anchorId: 'nursery-grid',
      waitFor: 'tutorial:plant:selected'
    },
    {
      mood: 'normal',
      message: 'Cada ficha muestra luz, riego, dificultad y nombre cientifico.',
      actionLabel: 'Entendido',
      next: 'manual'
    },
    {
      mood: 'happy',
      message: 'Elige una planta para empezar. Luego la llevaremos a tu jardin.',
      anchorId: 'btn-acquire-plant',
      waitFor: 'plant:acquired'
    },
    {
      mood: 'normal',
      message: 'Vuelve a Mi Jardin. El patio tiene luz directa; las habitaciones, luz indirecta.',
      anchorId: 'nav-btn-environment',
      waitFor: 'tutorial:screen:environment'
    },
    {
      mood: 'thinking',
      message: 'Arrastra tu planta a un espacio disponible. Observa si la luz le conviene.',
      anchorId: 'env-side-panel',
      waitFor: 'tutorial:plant:placed'
    },
    {
      mood: 'normal',
      message: 'Abre el panel de la planta. Antes de actuar, observa su estado.',
      anchorId: 'room-area',
      waitFor: 'tutorial:care-panel:opened'
    },
    {
      mood: 'thinking',
      message: 'El diagnostico te ayuda a pensar antes de regar, abonar o podar.',
      actionLabel: 'Entendido',
      next: 'manual'
    },
    {
      mood: 'happy',
      message: 'Listo. Ahora puedes cuidar tus plantas observando antes de actuar.',
      actionLabel: 'Terminar',
      next: 'finish'
    }
  ],

  async checkAndStart() {
    const result = await window.gameAPI.isTutorialCompleted()
    if (result.completed) return

    this._active = true
    this._currentStep = 0
    this._renderStep()
  },

  _renderStep() {
    if (!this._active) return

    this._clearListeners()
    const step = this._steps[this._currentStep]
    const actions = [
      {
        id: 'skip',
        label: 'Saltar tutorial',
        onClick: () => this._finish()
      }
    ]

    if (step.next === 'manual' || step.next === 'finish') {
      actions.push({
        id: 'next',
        label: step.actionLabel || 'Continuar',
        primary: true,
        onClick: () => {
          if (step.next === 'finish') this._finish()
          else this._next()
        }
      })
    }

    Guide.show({
      title: 'Guia del vivero',
      mood: step.mood,
      message: step.message,
      anchorId: step.anchorId,
      persistent: true,
      actions
    })

    if (step.waitFor) {
      this._waitFor(step.waitFor, () => this._next())
    }
  },

  _waitFor(eventName, handler) {
    const listener = () => handler()
    window.addEventListener(eventName, listener, { once: true })
    this._listeners.push({ eventName, listener })
  },

  _next() {
    if (!this._active) return
    this._currentStep += 1
    if (this._currentStep >= this._steps.length) {
      this._finish()
      return
    }
    this._renderStep()
  },

  _clearListeners() {
    this._listeners.forEach(({ eventName, listener }) => {
      window.removeEventListener(eventName, listener)
    })
    this._listeners = []
  },

  async _finish() {
    if (!this._active) return
    this._active = false
    this._clearListeners()
    Guide.hide()
    await window.gameAPI.completeTutorial()
  }
}

window.Tutorial = Tutorial
