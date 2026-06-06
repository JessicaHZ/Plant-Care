const EnvironmentDisplayUtils = {
  guideSprites: {
    normal: '../assets/guide/guide_normal.png',
    thinking: '../assets/guide/guide_thinking.png'
  },

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
      <div class="diagnosis-modal location-question-modal">
        <div class="location-question-layout">
          <div class="location-guide">
            <img
              class="location-guide-sprite"
              src="${this.guideSprites.thinking}"
              onerror="this.onerror=null; this.src='${this.guideSprites.normal}'"
              alt="Guia"
            />
          </div>

          <div class="location-question-content">
            <div class="diagnosis-header location-question-header">
              <h2 class="diagnosis-title">&iquest;Buena ubicacion?</h2>
            </div>

            <p class="location-speech-bubble">
              &iquest;Crees que esta planta estara bien aqui?
            </p>

            <div class="location-target-summary">
              <strong>${plantName}</strong> en <strong>${room.label}</strong>
              <span>Luz: ${room.luz}</span>
            </div>

            <div class="location-question-actions">
              <button class="btn btn-primary location-answer-btn" data-answer="yes">
                Si, creo que si
              </button>
              <button class="btn btn-secondary location-answer-btn" data-answer="no">
                No estoy seguro
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  },

  getLocationResultHTML({ plantName, room, actualLight }) {
    return `
      <div class="diagnosis-modal location-result-modal">
        <div class="diagnosis-header">
          <span class="diagnosis-icon">&#128161;</span>
          <h2 class="diagnosis-title">Resultado real</h2>
        </div>
        <p class="location-result-text">
          El <strong>${room.label}</strong> ${this.getLightConditionMessage(actualLight)}
          <br><br>
          Tu <strong>${plantName}</strong> ha sido colocada aqui.
          Si la luz no coincide con sus necesidades, su salud bajara lentamente
          con el paso de los dias simulados.
        </p>
        <div class="location-result-actions">
          <button class="btn btn-primary btn-full" id="btn-close-location-result">
            Entendido &rarr;
          </button>
        </div>
      </div>
    `
  }
}

window.EnvironmentDisplayUtils = EnvironmentDisplayUtils
