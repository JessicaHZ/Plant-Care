const WeeklyReviewDisplayUtils = {
  getFrequencyLabel(action, index) {
    const times = action.errorCount === 1 ? '1 vez' : `${action.errorCount} veces`
    if (index === 0) return `Mas frecuente: ${times}`
    if (index === 1) return `Frecuente: ${times}`
    return `Ocasional: ${times}`
  },

  getActionBarWidth(errorCount, maxErrorCount) {
    if (!maxErrorCount) return 0
    return Math.min(100, (errorCount / maxErrorCount) * 100)
  }
}

window.WeeklyReviewDisplayUtils = WeeklyReviewDisplayUtils
