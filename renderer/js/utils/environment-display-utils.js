const EnvironmentDisplayUtils = {
  getLightConditionMessage(lightCondition) {
    const lightMessages = {
      DIRECTA: 'recibe luz solar directa &mdash; ideal para plantas que necesitan sol intenso.',
      INDIRECTA: 'recibe luz indirecta &mdash; ideal para la mayoria de plantas de interior.',
      SOMBRA: 'recibe poca luz &mdash; solo para plantas que toleran la sombra.'
    }

    return lightMessages[lightCondition] || lightMessages.SOMBRA
  },

  getLocationQuestionHTML(plantName, room) {
    return `
      <div class="diagnosis-modal">
        <div class="diagnosis-header">
          <span class="diagnosis-icon">&#129300;</span>
          <h2 class="diagnosis-title">&iquest;Buena ubicacion?</h2>
          <p class="diagnosis-subtitle">
            Vas a colocar <strong>${plantName}</strong> en el
            <strong>${room.label}</strong> (luz ${room.luz})
          </p>
        </div>
        <p style="text-align:center; color: var(--color-text-muted); margin: 1rem 0">
          &iquest;Crees que esta planta estara bien en este espacio?
        </p>
        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap">
          <button class="btn btn-primary"   data-answer="yes">&#9989; Si, creo que si</button>
          <button class="btn btn-secondary" data-answer="no">&#10060; No estoy seguro</button>
          <button class="btn btn-ghost"     data-answer="dunno">&#129335; No se</button>
        </div>
      </div>
    `
  },

  getLocationResultHTML({ plantName, room, actualLight }) {
    return `
      <div class="diagnosis-modal">
        <div class="diagnosis-header">
          <span class="diagnosis-icon">&#128161;</span>
          <h2 class="diagnosis-title">Resultado real</h2>
        </div>
        <p style="text-align:center; color: var(--color-text); margin: 1rem 0; line-height: 1.6">
          El <strong>${room.label}</strong> ${this.getLightConditionMessage(actualLight)}
          <br><br>
          Tu <strong>${plantName}</strong> ha sido colocada aqui.
          Si la luz no coincide con sus necesidades, su salud bajara lentamente
          con el paso de los dias simulados.
        </p>
        <button class="btn btn-primary btn-full" id="btn-close-location-result">
          Entendido &rarr;
        </button>
      </div>
    `
  }
}

window.EnvironmentDisplayUtils = EnvironmentDisplayUtils
