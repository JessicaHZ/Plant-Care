const CareGuideDisplayUtils = {
  getContextualGuideHTML(guide) {
    return `
      <div class="diagnosis-modal contextual-guide-modal">
        <div class="diagnosis-header">
          <span class="diagnosis-icon">${guide.icon}</span>
          <h2 class="diagnosis-title">GuÃ­a de cuidado</h2>
          <p class="diagnosis-subtitle">${guide.title}</p>
        </div>

        <div class="guide-steps">
          ${guide.steps.map((step, index) => `
            <div class="guide-step">
              <div class="guide-step-num">${index + 1}</div>
              <p class="guide-step-text">${step}</p>
            </div>
          `).join('')}
        </div>

        <div class="guide-footer">
          <p class="guide-reminder">
            Esta guÃ­a aparece porque este patrÃ³n se repitiÃ³ varias veces.
            Observa la causa antes de actuar.
          </p>
          <button class="btn btn-primary btn-full" id="btn-close-guide">
            Entendido â†’
          </button>
        </div>
      </div>
    `
  }
}

window.CareGuideDisplayUtils = CareGuideDisplayUtils
