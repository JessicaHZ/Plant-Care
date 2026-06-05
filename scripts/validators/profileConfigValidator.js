const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function validateProfileConfig() {
  const configPath = path.join(__dirname, '..', '..', 'renderer', 'js', 'config', 'profileConfig.js')
  const source = fs.readFileSync(configPath, 'utf8')
  const sandbox = { window: {} }

  vm.runInNewContext(source, sandbox, { filename: configPath })

  const { ProfileConfig } = sandbox.window

  assert.ok(ProfileConfig, 'ProfileConfig debe exponerse en window')
  assert.strictEqual(ProfileConfig.levels.length, 5)
  assert.strictEqual(ProfileConfig.levels.map(level => level.nivel).join(','), '1,2,3,4,5')
  assert.strictEqual(ProfileConfig.levels[0].xpMin, 0)
  assert.strictEqual(ProfileConfig.levels[ProfileConfig.levels.length - 1].xpMin, 900)

  ProfileConfig.levels.forEach(level => {
    assert.strictEqual(typeof level.titulo, 'string')
    assert.ok(level.titulo.length > 0)
    assert.strictEqual(typeof level.xpMin, 'number')
  })

  assert.strictEqual(ProfileConfig.achievementCatalog.length, 10)
  assert.strictEqual(
    ProfileConfig.achievementCatalog.map(achievement => achievement.id).join(','),
    'primera_planta,cinco_plantas,primer_nivel,diagnostico_perfecto,racha_5,racha_10,evaluacion_correcta,sin_errores_semana,planta_nivel3,quiz_perfecto'
  )

  ProfileConfig.achievementCatalog.forEach(achievement => {
    assert.strictEqual(typeof achievement.id, 'string')
    assert.ok(achievement.id.length > 0)
    assert.strictEqual(typeof achievement.nombre, 'string')
    assert.ok(achievement.nombre.length > 0)
    assert.strictEqual(typeof achievement.descripcion, 'string')
    assert.ok(achievement.descripcion.length > 0)
    assert.strictEqual(typeof achievement.icono, 'string')
    assert.ok(achievement.icono.length > 0)
    assert.strictEqual(typeof achievement.tipo, 'string')
    assert.ok(achievement.tipo.length > 0)
  })

  assert.strictEqual(ProfileConfig.recommendationPatterns.length, 4)
  assert.strictEqual(
    ProfileConfig.recommendationPatterns.map(pattern => pattern.statKey).join(','),
    'errores_riego,errores_abono,errores_poda,errores_ubicacion'
  )
  assert.ok(ProfileConfig.defaultRecommendation.length > 0)

  ProfileConfig.recommendationPatterns.forEach(pattern => {
    assert.strictEqual(typeof pattern.statKey, 'string')
    assert.ok(pattern.statKey.length > 0)
    assert.strictEqual(typeof pattern.message, 'string')
    assert.ok(pattern.message.length > 0)
  })
}

module.exports = { validateProfileConfig }
