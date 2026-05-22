// Guide: personaje guia ligero para tutorial y pistas educativas.
// No contiene logica de juego; solo presenta mensajes breves y no invasivos.

const Guide = {
  _cooldowns: new Map(),
  _defaultCooldownMs: 45000,

  _sprites: {
    normal: '../assets/guide/guide_normal.png',
    happy: '../assets/guide/guide_happy.png',
    worried: '../assets/guide/guide_worried.png',
    thinking: '../assets/guide/guide_thinking.png',
    warning: '../assets/guide/guide_worried.png'
  },

  show({
    message,
    title = 'Guia del vivero',
    mood = 'normal',
    actions = [],
    anchorId = null,
    persistent = false,
    cooldownKey = null,
    cooldownMs = this._defaultCooldownMs
  }) {
    if (!message) return false
    if (cooldownKey && !this._canShow(cooldownKey, cooldownMs)) return false

    this.hide()

    const guide = document.createElement('div')
    guide.id = 'guide-bubble'
    guide.className = `guide-bubble guide-${mood}`
    guide.innerHTML = `
      <div class="guide-portrait">
        <img
          src="${this._sprites[mood] || this._sprites.normal}"
          alt="Personaje guia"
          onerror="this.style.display='none'; this.parentElement.classList.add('fallback')"
        />
        <span class="guide-fallback-icon">🌱</span>
      </div>
      <div class="guide-card">
        <div class="guide-card-header">
          <span class="guide-title">${title}</span>
          ${persistent ? '' : '<button class="guide-close" data-guide-action="close">x</button>'}
        </div>
        <p class="guide-message">${message}</p>
        ${actions.length > 0 ? `
          <div class="guide-actions">
            ${actions.map(action => `
              <button class="btn ${action.primary ? 'btn-primary' : 'btn-ghost'} guide-action"
                      data-guide-action="${action.id}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `

    document.body.appendChild(guide)

    if (anchorId) this.highlight(anchorId)

    guide.addEventListener('click', (e) => {
      const button = e.target.closest('[data-guide-action]')
      if (!button) return

      const actionId = button.dataset.guideAction
      if (actionId === 'close') {
        this.hide()
        return
      }

      const action = actions.find(item => item.id === actionId)
      if (action?.onClick) action.onClick()
    })

    return true
  },

  hide() {
    document.getElementById('guide-bubble')?.remove()
    this.clearHighlight()
  },

  highlight(elementId) {
    this.clearHighlight()
    const el = document.getElementById(elementId)
    if (el) el.classList.add('guide-highlight')
  },

  clearHighlight() {
    document.querySelectorAll('.guide-highlight')
      .forEach(el => el.classList.remove('guide-highlight'))
  },

  _canShow(key, cooldownMs) {
    const now = Date.now()
    const lastShown = this._cooldowns.get(key) || 0
    if (now - lastShown < cooldownMs) return false
    this._cooldowns.set(key, now)
    return true
  }
}

window.Guide = Guide
