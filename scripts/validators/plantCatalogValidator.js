const assert = require('assert/strict')

const plantCatalog = require('../../main/database/seeds/plantCatalog')

function validatePlantCatalog() {
  assert.equal(plantCatalog.length, 20, 'El catalogo debe contener 20 plantas')

  const requiredFields = [
    'nombre_planta',
    'nombre_cientifico',
    'tipo_planta',
    'tipo_luz',
    'frecuencia_riego',
    'nivel_dificultad',
    'tipo_poda',
    'descripcion',
    'sprite_key'
  ]
  const spriteKeys = new Set()

  for (const [index, plant] of plantCatalog.entries()) {
    for (const field of requiredFields) {
      assert.ok(
        plant[field] !== undefined && plant[field] !== null && plant[field] !== '',
        `La planta #${index + 1} no tiene ${field}`
      )
    }

    assert.equal(Number.isInteger(plant.frecuencia_riego), true, `${plant.nombre_planta}: frecuencia_riego debe ser entero`)
    assert.equal(plant.frecuencia_riego > 0, true, `${plant.nombre_planta}: frecuencia_riego debe ser positivo`)
    assert.equal(spriteKeys.has(plant.sprite_key), false, `sprite_key duplicado: ${plant.sprite_key}`)
    spriteKeys.add(plant.sprite_key)
  }
}

module.exports = {
  validatePlantCatalog
}
