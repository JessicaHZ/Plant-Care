// SlotEditor: herramienta temporal de desarrollo para ajustar slots visualmente.
// Activar/desactivar con F2 en la pantalla de Mi Jardin. No persiste cambios.

const SlotEditor = {
  _active: false,
  _dragging: null,

  init() {
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'F2') return
      e.preventDefault()
      this.toggle()
    })
  },

  toggle() {
    if (!window.Environment) return
    this._active = !this._active
    document.body.classList.toggle('slot-editor-active', this._active)
    this._renderPanel()
    Environment.refreshCurrentRoom()
  },

  decorateSlot(slotEl, slot) {
    if (!this._active) return

    slotEl.classList.add('slot-editor-slot')
    slotEl.innerHTML = `<span>${slot.id}</span>`

    slotEl.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()

      this._dragging = {
        slot,
        area: document.getElementById('room-area')
      }

      document.addEventListener('mousemove', this._handleMove)
      document.addEventListener('mouseup', this._handleUp, { once: true })
    })
  },

  _handleMove: (e) => {
    const editor = window.SlotEditor
    if (!editor?._dragging) return

    const { slot, area } = editor._dragging
    const rect = area.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    slot.x = Math.max(0, Math.min(100, Number(x.toFixed(1))))
    slot.y = Math.max(0, Math.min(100, Number(y.toFixed(1))))

    Environment.refreshCurrentRoom()
    editor._renderPanel()
  },

  _handleUp: () => {
    const editor = window.SlotEditor
    document.removeEventListener('mousemove', editor._handleMove)
    editor._dragging = null
  },

  _renderPanel() {
    document.getElementById('slot-editor-panel')?.remove()
    if (!this._active) return

    const room = Environment._currentRoom
    const slots = Environment._slots[room] || []
    const panel = document.createElement('div')
    panel.id = 'slot-editor-panel'
    panel.className = 'slot-editor-panel'
    panel.innerHTML = `
      <div class="slot-editor-header">
        <strong>Editor de slots</strong>
        <button id="slot-editor-close">x</button>
      </div>
      <p>Habitacion: ${room}</p>
      <textarea readonly>${this._formatSlots(room, slots)}</textarea>
      <div class="slot-editor-actions">
        <button id="slot-editor-copy">Copiar coordenadas</button>
        <button id="slot-editor-reset">Re-render</button>
      </div>
      <small>F2 activa/desactiva. Arrastra los circulos para ajustar.</small>
    `

    document.body.appendChild(panel)
    panel.querySelector('#slot-editor-close')
      .addEventListener('click', () => this.toggle())
    panel.querySelector('#slot-editor-reset')
      .addEventListener('click', () => Environment.refreshCurrentRoom())
    panel.querySelector('#slot-editor-copy')
      .addEventListener('click', async () => {
        const text = this._formatSlots(room, slots)
        await navigator.clipboard.writeText(text)
      })
  },

  _formatSlots(room, slots) {
    return `'${room}': [
${slots.map(slot => `  { id: '${slot.id}', x: ${slot.x}, y: ${slot.y} },`).join('\n')}
]`
  }
}

window.SlotEditor = SlotEditor
