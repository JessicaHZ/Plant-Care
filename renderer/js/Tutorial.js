// Tutorial: guia inicial basada en acciones reales del jugador.
// Mantiene el flujo simple: mensajes breves, highlights y eventos de progreso.

const Tutorial = {
  _currentStep: 0,
  _active: false,
  _listeners: [],
  _screenListener: null,

  _steps: [
    {
      mood: 'happy',
      message: 'Objetivo: preparar tu primera planta y ver como responde con el tiempo.',
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
      message: 'Objetivo: revisar la ficha. Fijate en luz, riego, dificultad y nombre cientifico.',
      actionLabel: 'Entendido',
      next: 'manual'
    },
    {
      mood: 'happy',
      message: 'Objetivo: adquirir una planta. Puedes tener varias, pero empieza con una.',
      anchorId: 'btn-acquire-plant',
      waitFor: 'plant:acquired'
    },
    {
      mood: 'normal',
      message: 'Vuelve a Mi Jardin con el boton Volver. El patio tiene luz directa; las habitaciones, luz indirecta.',
      anchorId: 'btn-nursery-back',
      waitFor: 'tutorial:screen:environment'
    },
    {
      mood: 'thinking',
      message: 'Objetivo: colocar la planta. La luz del lugar afectara su salud con los dias.',
      anchorId: 'env-side-panel',
      waitFor: 'tutorial:plant:placed'
    },
    {
      mood: 'normal',
      message: 'Objetivo: abrir el panel de cuidado. Desde ahi puedes regar, abonar o podar cuando corresponda.',
      anchorId: 'room-area',
      waitFor: 'tutorial:care-panel:opened'
    },
    {
      mood: 'thinking',
      message: 'Objetivo: realiza una accion de cuidado. Al elegir regar o abonar, responde el diagnostico antes de actuar.',
      anchorId: 'room-area',
      waitFor: 'tutorial:care-action:completed'
    },
    {
      mood: 'thinking',
      message: 'Objetivo: avanza un dia. El tiempo simulado convierte tus decisiones en consecuencias visibles.',
      anchorId: 'btn-advance-day',
      waitFor: 'simulation:tick'
    },
    {
      mood: 'normal',
      message: 'Cada semana recibiras una revision: si hubo errores, reflexionas; si no, se reconoce tu buen cuidado.',
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

    if (this._active) this.cancel()

    this._active = true
    this._currentStep = 0
    this._bindScreenListener()
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
      title: `Guia inicial ${this._currentStep + 1}/${this._steps.length}`,
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

  _bindScreenListener() {
    if (this._screenListener) return

    this._screenListener = ({ detail }) => {
      if (!this._active) return

      const currentScreen = detail?.to
      if (currentScreen === 'splash') {
        this.cancel()
        return
      }

      if (!this._isTutorialScreen(currentScreen)) {
        Guide.hide()
        return
      }

      setTimeout(() => this._renderStep(), 0)
    }

    window.addEventListener('screen:changed', this._screenListener)
  },

  _unbindScreenListener() {
    if (!this._screenListener) return
    window.removeEventListener('screen:changed', this._screenListener)
    this._screenListener = null
  },

  _isTutorialScreen(screenName) {
    return screenName === 'environment' || screenName === 'nursery'
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
    this._unbindScreenListener()
    Guide.hide()
    await window.gameAPI.completeTutorial()
  },

  cancel() {
    if (!this._active) return
    this._active = false
    this._clearListeners()
    this._unbindScreenListener()
    Guide.hide()
  }
}

window.Tutorial = Tutorial
