// ScreenManager: controla la navegación entre pantallas del juego.
//
// Patrón: SPA con visibilidad CSS — una sola pantalla activa a la vez.
// Cada pantalla es un elemento con clase .screen e id="screen-{nombre}".
//
// Uso:
//   ScreenManager.show('menu')      → navega al menú principal
//   ScreenManager.back()            → regresa a la pantalla anterior
//   ScreenManager.current()         → nombre de la pantalla activa
//
// Eventos emitidos en window:
//   'screen:changed' → detail: { from: string, to: string }
//   Permite que otros módulos reaccionen al cambio sin acoplamiento directo.

const ScreenManager = {

  _current:  null,   // pantalla activa
  _previous: null,   // pantalla anterior (para back())

  // Muestra la pantalla indicada y oculta todas las demás.
  // Emite el evento 'screen:changed' al completar la transición.
  show(screenName) {
    const allScreens = document.querySelectorAll('.screen')
    allScreens.forEach(screen => screen.classList.remove('active'))

    const target = document.getElementById(`screen-${screenName}`)
    if (!target) {
      console.error(`ScreenManager: "screen-${screenName}" no encontrada en el DOM`)
      return
    }

    target.classList.add('active')

    // Guardamos el historial antes de actualizar
    this._previous = this._current
    this._current  = screenName

    // Notifica a otros módulos sin acoplarlos directamente
    window.dispatchEvent(new CustomEvent('screen:changed', {
      detail: { from: this._previous, to: this._current }
    }))

    console.log(`[ScreenManager] ${this._previous ?? 'inicio'} → ${this._current}`)
  },

  // Regresa a la pantalla anterior si existe.
  back() {
    if (!this._previous) {
      console.warn('[ScreenManager] No hay pantalla anterior registrada')
      return
    }
    this.show(this._previous)
  },

  // Devuelve el nombre de la pantalla activa.
  current() {
    return this._current
  },

  // Inicializa el manager mostrando la pantalla de entrada del juego.
  // Debe llamarse una sola vez al cargar el DOM.
  // Sin autenticación, la pantalla inicial es el menú principal.
  init() {
    this.show('main-menu')
  }

}

window.ScreenManager = ScreenManager