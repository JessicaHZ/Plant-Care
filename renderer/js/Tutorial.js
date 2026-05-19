// Tutorial: guía interactiva para nuevos jugadores (RF-27).
// Se activa automáticamente la primera vez que se abre el juego.
// Es obligatorio en el paso 1, saltable a partir del paso 2.
//
// Flujo de 5 pasos:
//   1. Bienvenida        → presentación del juego (no saltable)
//   2. El vivero         → cómo adquirir plantas
//   3. El entorno        → cómo colocar plantas
//   4. El cuidado        → regar, abonar, podar + diagnóstico
//   5. Fin del tutorial  → invitación a explorar

const Tutorial = {

  _currentStep: 0,
  _overlay:     null,

  _steps: [
    {
      icon:       '🌿',
      title:      '¡Bienvenido a Brote!',
      content:    `Brote es un simulador de cuidado de plantas donde aprenderás
                  a cuidarlas correctamente mediante la práctica.
                  Cada decisión que tomes afectará la salud de tus plantas —
                  regar de más, abonar sin necesidad o colocarlas en el lugar
                  equivocado tiene consecuencias reales.`,
      highlight:  null,          // sin highlight en el paso 1
      skippable:  false,         // obligatorio
      btnNext:    'Comenzar →'
    },
    {
      icon:       '🌱',
      title:      'El Vivero',
      content:    `En el <strong>Vivero</strong> encontrarás un catálogo de
                  20 especies de plantas reales, cada una con su nombre científico,
                  tipo de luz, frecuencia de riego y nivel de dificultad.
                  <br><br>
                  Adquiere las plantas que quieras cuidar y agrégalas a tu colección.`,
      highlight:  'nav-btn-nursery',    // resalta el botón del vivero en el menú
      skippable:  true,
      btnNext:    'Siguiente →'
    },
    {
      icon:       '🏠',
      title:      'Tu Entorno',
      content:    `En <strong>Mi Entorno</strong> tienes tres espacios donde colocar
                  tus plantas: Sala, Jardín y Dormitorio. Cada uno tiene condiciones
                  de luz distintas.
                  <br><br>
                  Arrastra cada planta al slot que consideres más adecuado —
                  pero piénsalo bien: la ubicación afecta directamente su salud.`,
      highlight:  'nav-btn-environment',
      skippable:  true,
      btnNext:    'Siguiente →'
    },
    {
      icon:       '💧',
      title:      'El Cuidado',
      content:    `Al hacer clic en una planta verás sus herramientas de cuidado:
                  <strong>Regar</strong>, <strong>Abonar</strong> y
                  <strong>Podar</strong> (disponible desde nivel 2).
                  <br><br>
                  Antes de cada acción, el juego te pedirá que <strong>diagnostiques
                  el estado de la planta</strong>. Observa sus indicadores y elige
                  la causa correcta — esto activa tu capacidad de análisis y
                  te da XP adicional si aciertas.`,
      highlight:  null,
      skippable:  true,
      btnNext:    'Siguiente →'
    },
    {
      icon:       '🌟',
      title:      '¡Listo para empezar!',
      content:    `Recuerda:
                  <br><br>
                  🔍 <strong>Diagnostica</strong> antes de actuar<br>
                  💧 <strong>Riega</strong> solo cuando sea necesario<br>
                  📍 <strong>Ubica</strong> tus plantas según su tipo de luz<br>
                  📊 <strong>Revisa</strong> tu progreso cada semana
                  <br><br>
                  ¡Tus plantas dependen de ti. Buena suerte, jardinero!`,
      highlight:  null,
      skippable:  true,
      btnNext:    '¡Empezar a jugar! 🌿'
    },
  ],

  // Verifica si debe mostrarse y lo inicia si corresponde.
  async checkAndStart() {
    const result = await window.gameAPI.isTutorialCompleted()
    if (result.completed) return   // ya lo vio, no mostrar

    this._currentStep = 0
    this._createOverlay()
    this._renderStep()
  },

  _createOverlay() {
    // Limpia overlay anterior si existiera
    const existing = document.getElementById('tutorial-overlay')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id        = 'tutorial-overlay'
    overlay.className = 'tutorial-overlay'
    document.body.appendChild(overlay)
    this._overlay = overlay

    // Delegación de eventos en el overlay
    overlay.addEventListener('click', (e) => this._handleClick(e))
  },

  _renderStep() {
    const step      = this._steps[this._currentStep]
    const isLast    = this._currentStep === this._steps.length - 1
    const isFirst   = this._currentStep === 0

    // Limpia highlight anterior
    this._clearHighlight()

    // Aplica highlight si el paso lo requiere
    if (step.highlight) {
      this._applyHighlight(step.highlight)
    }

    // Indicadores de progreso
    const dots = this._steps.map((_, i) => `
      <div class="tutorial-dot ${i === this._currentStep ? 'active' : i < this._currentStep ? 'done' : ''}"></div>
    `).join('')

    this._overlay.innerHTML = `
      <div class="tutorial-modal">

        <div class="tutorial-header">
          <span class="tutorial-icon">${step.icon}</span>
          <div class="tutorial-dots">${dots}</div>
          ${step.skippable ? `
            <button class="tutorial-skip-btn" id="btn-tutorial-skip">
              Saltar tutorial
            </button>
          ` : '<div></div>'}
        </div>

        <h2 class="tutorial-title">${step.title}</h2>

        <p class="tutorial-content">${step.content}</p>

        <div class="tutorial-footer">
          ${!isFirst ? `
            <button class="btn btn-ghost" id="btn-tutorial-prev">← Anterior</button>
          ` : '<div></div>'}
          <button class="btn btn-primary" id="btn-tutorial-next">
            ${step.btnNext}
          </button>
        </div>

      </div>
    `
  },

  _handleClick(e) {
    // Siguiente paso
    if (e.target.id === 'btn-tutorial-next') {
      const isLast = this._currentStep === this._steps.length - 1
      if (isLast) {
        this._finish()
      } else {
        this._currentStep++
        this._renderStep()
      }
      return
    }

    // Paso anterior
    if (e.target.id === 'btn-tutorial-prev') {
      if (this._currentStep > 0) {
        this._currentStep--
        this._renderStep()
      }
      return
    }

    // Saltar tutorial
    if (e.target.id === 'btn-tutorial-skip') {
      this._finish()
    }
  },

  // Resalta el botón del menú correspondiente al paso actual
  _applyHighlight(elementId) {
    const el = document.getElementById(elementId)
    if (!el) return
    el.classList.add('tutorial-highlight')
  },

  // Limpia todos los highlights activos
  _clearHighlight() {
    document.querySelectorAll('.tutorial-highlight')
      .forEach(el => el.classList.remove('tutorial-highlight'))
  },

  // Finaliza el tutorial: limpia UI y marca como completado en BD
  async _finish() {
    this._clearHighlight()
    this._overlay.remove()
    this._overlay = null
    await window.gameAPI.completeTutorial()
  }

}

window.Tutorial = Tutorial