const NumberUtils = {
  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }
}

window.NumberUtils = NumberUtils
