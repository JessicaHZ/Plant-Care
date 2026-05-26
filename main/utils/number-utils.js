function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function toNonNegativeInteger(value) {
  return Math.max(0, Math.floor(Number(value) || 0))
}

function clampInteger(value, min, max) {
  return clamp(Math.floor(Number(value) || 0), min, max)
}

module.exports = {
  clamp,
  toNonNegativeInteger,
  clampInteger
}
