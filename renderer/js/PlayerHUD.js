// PlayerHUD: barra de estadísticas del jugador en la parte superior.
// Muestra nivel, XP, racha y cantidad de plantas.
//
// Sin autenticación: no hay nombre de usuario.
// Los datos vienen de BD Progreso (nivel, experiencia, racha_dias).
//
// Uso:
//   PlayerHUD.init()                        → crea el HUD en el DOM
//   PlayerHUD.update(progressData, count)   → actualiza los valores

const PlayerHUD = {

  init() {
    if (document.getElementById('player-hud')) return

    const hud = document.createElement('div')
    hud.id        = 'player-hud'
    hud.className = 'player-hud'   // ✅ siempre visible, sin 'hidden'
    hud.innerHTML = `
      <div class="hud-left">
        <span class="hud-avatar">🌱</span>
        <span class="hud-game-title">Mi Jardín</span>
      </div>
      <div class="hud-stats">
        <div class="hud-stat">
          <span class="hud-stat-icon">⭐</span>
          <span class="hud-stat-label">Nivel</span>
          <span class="hud-stat-value" id="hud-level">1</span>
        </div>
        <div class="hud-stat">
          <span class="hud-stat-icon">✨</span>
          <span class="hud-stat-label">XP</span>
          <span class="hud-stat-value" id="hud-xp">0</span>
        </div>
        <div class="hud-stat">
          <span class="hud-stat-icon">🔥</span>
          <span class="hud-stat-label">Racha</span>
          <span class="hud-stat-value" id="hud-streak">0</span>
        </div>
        <div class="hud-stat">
          <span class="hud-stat-icon">🌿</span>
          <span class="hud-stat-label">Plantas</span>
          <span class="hud-stat-value" id="hud-plants">0</span>
        </div>
      </div>
    `
    

    document.body.insertBefore(hud, document.body.firstChild)
  },

  // Actualiza el HUD con datos de BD Progreso.
  // progressData: { nivel, experiencia, racha_dias }
  // plantCount: número de plantas en la colección del jugador
  update(progressData, plantCount = 0) {
    const hud = document.getElementById('player-hud')
    if (!hud || !progressData) return

    document.getElementById('hud-level').textContent  = progressData.nivel
    document.getElementById('hud-xp').textContent     = progressData.experiencia
    document.getElementById('hud-streak').textContent = progressData.racha_dias
    document.getElementById('hud-plants').textContent = plantCount
  },

  // Conservado por compatibilidad — puede usarse si en el futuro
  // hay pantallas donde el HUD no deba mostrarse (ej. tutorial).
  hide() {
    const hud = document.getElementById('player-hud')
    if (hud) hud.classList.add('hidden')
  },

  show() {
    const hud = document.getElementById('player-hud')
    if (hud) hud.classList.remove('hidden')
  }

}

window.PlayerHUD = PlayerHUD