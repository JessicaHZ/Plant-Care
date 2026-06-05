const NurseryDisplayUtils = {
  getDifficultyColor(difficulty) {
    if (difficulty === 'MEDIO') return '#ffa726'
    if (String(difficulty).includes('DIF')) return '#ef5350'
    if (String(difficulty).includes('F')) return '#66bb6a'
    return '#fff'
  },

  getLightIcon(lightType) {
    const lightIcon = {
      DIRECTA: '\u2600\ufe0f',
      INDIRECTA: '\ud83c\udf24\ufe0f',
      SOMBRA: '\ud83c\udf2b\ufe0f'
    }

    return lightIcon[lightType] || '\ud83d\udca1'
  },

  getPlantTypeConfig(plantType) {
    const typeConfig = {
      SUCULENTA: { icon: '\ud83c\udf35', color: '#80cbc4' },
      ORNAMENTAL: { icon: '\ud83c\udf38', color: '#ce93d8' },
      AROMATICA: { icon: '\ud83c\udf3f', color: '#a5d6a7' },
      FRUTAL: { icon: '\ud83c\udf4b', color: '#fff176' },
      CACTUS: { icon: '\ud83c\udf35', color: '#80cbc4' },
      OTRO: { icon: '\ud83c\udf31', color: '#b0bec5' }
    }

    return typeConfig[plantType] || typeConfig.OTRO
  },

  getPruningLabel(pruningType) {
    const pruningLabel = {
      NUNCA: 'No requiere poda',
      OCASIONAL: 'Poda ocasional',
      FRECUENTE: 'Poda frecuente'
    }

    return pruningLabel[pruningType] || 'Poda no definida'
  }
}

window.NurseryDisplayUtils = NurseryDisplayUtils
