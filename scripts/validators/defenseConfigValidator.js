const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateDefenseConfig() {
  const configPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'config', 'defenseConfig.js')
  const source = fs.readFileSync(configPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: configPath })

  const { DefenseConfig } = sandbox.window

  assert.ok(DefenseConfig, 'DefenseConfig debe exponerse en window')
  assert.strictEqual(DefenseConfig.maxSpeed, 2.5)
  assert.strictEqual(DefenseConfig.pests.length, 6)
  assert.strictEqual(DefenseConfig.allies.length, 4)
  assert.strictEqual(DefenseConfig.waves.length, 5)
  assert.ok(DefenseConfig.pests.every(pest => pest.name && pest.label && pest.xp > 0))
  assert.ok(DefenseConfig.allies.every(ally => ally.name && ally.label && ally.speed > 0))
  assert.ok(DefenseConfig.waves.every(wave => wave.pests > 0 && wave.spawnMs > 0))
}

module.exports = { validateDefenseConfig }
