// ProfileScreen: pantalla de perfil del jugador.
// RF-26: estadísticas, nivel, logros.
// Organizada en 3 pestañas: Progreso, Estadísticas, Logros.

const ProfileScreen = {

  // Definición de niveles con título y XP requerido
  _levels: [
    { nivel: 1,  titulo: 'Aprendiz',       xpMin: 0   },
    { nivel: 2,  titulo: 'Cuidador',        xpMin: 100 },
    { nivel: 3,  titulo: 'Jardinero',       xpMin: 250 },
    { nivel: 4,  titulo: 'Botánico',        xpMin: 500 },
    { nivel: 5,  titulo: 'Experto Verde',   xpMin: 900 },
  ],

  // Catálogo completo de logros del juego
  // bloqueado: true = aún no obtenido, se muestra como ???
  _achievementCatalog: [
    {
      id:          'primera_planta',
      nombre:      'Primer Brote',
      descripcion: 'Adquiere tu primera planta',
      icono:       '🌱',
      tipo:        'PROGRESO'
    },
    {
      id:          'cinco_plantas',
      nombre:      'Pequeño Jardín',
      descripcion: 'Ten 5 plantas en tu colección',
      icono:       '🪴',
      tipo:        'PROGRESO'
    },
    {
      id:          'primer_nivel',
      nombre:      'Cuidador Novato',
      descripcion: 'Alcanza el nivel 2',
      icono:       '⭐',
      tipo:        'PROGRESO'
    },
    {
      id:          'diagnostico_perfecto',
      nombre:      'Ojo Clínico',
      descripcion: 'Acierta 10 diagnósticos previos',
      icono:       '🔍',
      tipo:        'EDUCATIVO'
    },
    {
      id:          'racha_5',
      nombre:      'Constante',
      descripcion: 'Mantén una racha de 5 días',
      icono:       '🔥',
      tipo:        'RACHA'
    },
    {
      id:          'racha_10',
      nombre:      'Dedicado',
      descripcion: 'Mantén una racha de 10 días',
      icono:       '🔥',
      tipo:        'RACHA'
    },
    {
      id:          'evaluacion_correcta',
      nombre:      'Evaluador Reflexivo',
      descripcion: 'Identifica correctamente la decisión más perjudicial en la revisión semanal',
      icono:       '📊',
      tipo:        'EVALUACION'
    },
    {
      id:          'sin_errores_semana',
      nombre:      'Semana Perfecta',
      descripcion: 'Completa una semana sin errores de cuidado',
      icono:       '🌟',
      tipo:        'EDUCATIVO'
    },
    {
      id:          'planta_nivel3',
      nombre:      'Verde Experto',
      descripcion: 'Alcanza el nivel 3',
      icono:       '🏅',
      tipo:        'PROGRESO'
    },
    {
      id:          'quiz_perfecto',
      nombre:      'Maestro Botanista',
      descripcion: 'Responde correctamente las 5 preguntas del quiz',
      icono:       '🎓',
      tipo:        'EDUCATIVO'
    },
  ],

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
  },

  // ── Pestaña Progreso ──────────────────────────────────────────────────────

  _renderProgress(progress) {
    const maxLevel   = this._levels[this._levels.length - 1]
    const nivel      = Math.min(progress.nivel || 1, maxLevel.nivel)
    const xp         = progress.experiencia || 0
    const levelData  = this._levels.find(l => l.nivel === nivel) || maxLevel
    const nextLevel  = this._levels.find(l => l.nivel === nivel + 1)

    // Badge y título
    document.getElementById('profile-level-badge').textContent = nivel
    document.getElementById('profile-level-title').textContent = levelData.titulo

    // Barra de XP
    const xpForCurrent = levelData.xpMin
    const xpForNext    = nextLevel ? nextLevel.xpMin : xpForCurrent + 100
    const xpProgress   = nextLevel
      ? ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100
      : 100

    document.getElementById('profile-xp-current').textContent = `${xp} XP`
    document.getElementById('profile-xp-next').textContent    = nextLevel
      ? `${xpForNext} XP para nivel ${nextLevel.nivel}`
      : '¡Nivel máximo alcanzado!'

    document.getElementById('profile-xp-fill').style.width =
      `${Math.min(100, Math.max(0, xpProgress))}%`

    // Lista de niveles
    const list = document.getElementById('profile-levels-list')
    list.innerHTML = this._levels.map(l => {
      const isCompleted = nivel > l.nivel
      const isCurrent   = nivel === l.nivel
      const isLocked    = nivel < l.nivel

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
  },

  // ── Pestaña Logros ────────────────────────────────────────────────────────

  _renderAchievements(obtainedAchievements) {
    const obtainedIds = new Set(obtainedAchievements.map(a => a.id_logro))
    const list        = document.getElementById('achievements-list')

    list.innerHTML = this._achievementCatalog.map(achievement => {
      const isObtained = obtainedIds.has(achievement.id)
      const tipoColor  = {
        'PROGRESO':   '#66bb6a',
        'EDUCATIVO':  '#42a5f5',
        'RACHA':      '#ffa726',
        'EVALUACION': '#ab47bc'
      }

      return `
        <div class="achievement-card ${isObtained ? 'obtained' : 'locked'}">
          <div class="achievement-icon">${isObtained ? achievement.icono : '🔒'}</div>
          <div class="achievement-info">
            <p class="achievement-name">
              ${isObtained ? achievement.nombre : '???'}
            </p>
            <p class="achievement-desc">
              ${isObtained ? achievement.descripcion : 'Logro bloqueado'}
            </p>
          </div>
          <div class="achievement-tipo"
               style="color: ${tipoColor[achievement.tipo] || '#fff'}">
            ${achievement.tipo}
          </div>
        </div>
      `
    }).join('')
  },

  // ── Pestañas ──────────────────────────────────────────────────────────────

  _bindTabs() {
    document.querySelectorAll('.profile-tab').forEach(tab => {
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
