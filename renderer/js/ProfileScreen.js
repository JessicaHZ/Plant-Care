// ProfileScreen: pantalla de perfil del jugador.
// RF-26: estadísticas, nivel, logros.
// Organizada en 3 pestañas: Progreso, Estadísticas, Logros.

const ProfileScreen = {

  async init() {
    this._bindTabs()
    await this._loadAll()
  },

  // Carga todos los datos y rellena las tres pestañas
  async _loadAll() {
    const [progressResult, statsResult, achievementsResult] = await Promise.all([
      window.gameAPI.getProgress(),
      window.gameAPI.getStats(),
      window.gameAPI.getAchievements()
    ])

    const progress     = progressResult.success     ? progressResult.progress         : {}
    const stats        = statsResult.success         ? statsResult.stats               : {}
    const achievements = achievementsResult.success  ? achievementsResult.achievements : []

    this._renderProgress(progress)
    this._renderStats(stats, progress)
    this._renderAchievements(achievements)
    this._renderProfileIcons()
  },

  // ── Pestaña Progreso ──────────────────────────────────────────────────────

  _renderProgress(progress) {
    const progressView = ProfileDisplayUtils.getProgressViewModel({
      progress,
      levels: ProfileConfig.levels
    })

    // Badge y título
    document.getElementById('profile-level-badge').textContent = progressView.level
    document.getElementById('profile-level-title').textContent = progressView.levelData.titulo

    // Barra de XP
    document.getElementById('profile-xp-current').textContent = `${progressView.xp} XP`
    document.getElementById('profile-xp-next').textContent    = progressView.nextXpText
    document.getElementById('profile-xp-fill').style.width =
      `${NumberUtils.clamp(progressView.xpProgress, 0, 100)}%`

    // Lista de niveles
    const list = document.getElementById('profile-levels-list')
    list.innerHTML = ProfileConfig.levels.map(l => {
      const isCompleted = progressView.level > l.nivel
      const isCurrent   = progressView.level === l.nivel
      const isLocked    = progressView.level < l.nivel

      return `
        <div class="level-row ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}">
          <div class="level-row-badge">${l.nivel}</div>
          <div class="level-row-info">
            <span class="level-row-title">${l.titulo}</span>
            <span class="level-row-xp">${l.xpMin} XP</span>
          </div>
          <div class="level-row-status">
            ${isCompleted ? '✅' : isCurrent ? '▶️' : '🔒'}
          </div>
        </div>
      `
    }).join('')
  },

  // ── Pestaña Estadísticas ──────────────────────────────────────────────────

  _renderStats(stats, progress) {
    const set = (id, val) => {
      const el = document.getElementById(id)
      if (el) el.textContent = val ?? 0
    }

    set('stat-errores-riego',      stats.errores_riego)
    set('stat-errores-abono',      stats.errores_abono)
    set('stat-errores-poda',       stats.errores_poda)
    set('stat-errores-ubicacion',  stats.errores_ubicacion)
    set('stat-acciones-correctas', stats.acciones_correctas)
    set('stat-diagnosticos',       stats.diagnosticos_correctos)
    set('stat-plantas-muertas',    stats.plantas_muertas)
    set('stat-racha',              progress.racha_dias)
    this._renderRecommendation(stats)
  },

  _renderRecommendation(stats) {
    const textEl = document.getElementById('profile-recommendation-text')
    if (!textEl) return

    textEl.textContent = ProfileDisplayUtils.getRecommendationText(
      stats,
      ProfileConfig.recommendationPatterns,
      ProfileConfig.defaultRecommendation
    )
  },

  _renderProfileIcons() {
    document.querySelectorAll('[data-profile-icon]').forEach(iconEl => {
      const iconKey = iconEl.dataset.profileIcon
      const fallback = iconEl.textContent.trim()
      iconEl.innerHTML = window.AssetPaths.getProfileIconHTML(iconKey, fallback, 'profile-pixel-icon')
    })
  },

  // ── Pestaña Logros ────────────────────────────────────────────────────────

  _renderAchievements(obtainedAchievements) {
    const obtainedIds = new Set(obtainedAchievements.map(a => a.id_logro))
    const list        = document.getElementById('achievements-list')

    list.innerHTML = ProfileConfig.achievementCatalog.map(achievement => {
      const isObtained = obtainedIds.has(achievement.id)

      return `
        <div class="achievement-card ${isObtained ? 'obtained' : 'locked'}">
          <div class="achievement-icon">
            ${isObtained
              ? window.AssetPaths.getProfileIconHTML(achievement.iconKey, achievement.icono, 'profile-pixel-icon')
              : window.AssetPaths.getProfileIconHTML('achievement-locked', '🔒', 'profile-pixel-icon')}
          </div>
          <div class="achievement-info">
            <p class="achievement-name">
              ${isObtained ? achievement.nombre : '???'}
            </p>
            <p class="achievement-desc">
              ${isObtained ? achievement.descripcion : 'Logro bloqueado'}
            </p>
          </div>
          <div class="achievement-tipo"
               style="color: ${ProfileDisplayUtils.getAchievementTypeColor(achievement.tipo)}">
            ${achievement.tipo}
          </div>
        </div>
      `
    }).join('')
  },

  // ── Pestañas ──────────────────────────────────────────────────────────────

  _bindTabs() {
    document.querySelectorAll('.profile-tab').forEach(tab => {
      if (tab.dataset.bound === 'true') return
      tab.dataset.bound = 'true'

      tab.addEventListener('click', () => {
        // Activa la pestaña seleccionada
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'))
        document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('active'))

        tab.classList.add('active')
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active')
      })
    })
  }

}

window.ProfileScreen = ProfileScreen
