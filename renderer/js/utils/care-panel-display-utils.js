const CarePanelDisplayUtils = {
  getCarePanelHTML({ plant, playerLevel, pruneUnlocked }) {
    const nutrientes = plant.nutrientes ?? 50
    const pruneAvailable = plant.tipo_poda !== 'NUNCA' &&
      plant.requiere_poda_activa === 1
    const pruneState = CareDisplayUtils.getPruneButtonState({
      pruneUnlocked,
      pruneAvailable
    })

    return `
      <div class="care-panel-header">
        <h3 class="care-panel-name">${plant.nombre_planta}</h3>
        <button class="btn btn-ghost" id="btn-close-care">&times;</button>
      </div>
      <img
        class="care-panel-sprite"
        src="${CareDisplayUtils.getPlantSpritePath(plant.sprite_key, plant.estado_planta)}"
        onerror="this.src='${CareDisplayUtils.plantPlaceholderPath}'"
        alt="${plant.nombre_planta}"
      />
      <div class="care-panel-bars">
        ${CareDisplayUtils.getCareMeterHTML({
        icon: '&#128167;',
        label: 'Humedad',
        value: plant.humedad,
        state: playerLevel <= 2 ? CareDisplayUtils.getHumidityState(plant.humedad) : '',
        type: 'balanced'
      })}
        ${CareDisplayUtils.getCareMeterHTML({
        icon: '&hearts;',
        label: 'Salud',
        value: plant.salud,
        state: CareDisplayUtils.getHealthState(plant.salud),
        type: 'health'
      })}
        ${CareDisplayUtils.getCareMeterHTML({
        icon: '&#127807;',
        label: 'Nutrientes',
        value: nutrientes,
        state: playerLevel <= 2 ? CareDisplayUtils.getNutrientState(nutrientes) : '',
        type: 'balanced'
      })}
      </div>
      <div class="care-panel-actions">
        <button class="btn btn-primary btn-pixel care-action-btn" id="btn-water">
          &#128167; Regar
        </button>
        <button class="btn btn-secondary btn-pixel care-action-btn" id="btn-fertilize">
          &#127807; Abonar
        </button>
        <button class="btn btn-pixel care-action-btn ${pruneState.buttonClass}"
                id="btn-prune"
                ${pruneState.disabledAttribute}>
          ${pruneState.label}
        </button>
      ${plant.ubicacion ? `
        <button class="btn btn-ghost btn-pixel care-action-btn" id="btn-move-plant"
                style="width:100%">
          &#128230; Cambiar de lugar
        </button>
      ` : ''}
      </div>
    `
  },

  getDeadPlantPanelHTML(plant) {
    return `
      <div class="care-panel-header">
        <h3 class="care-panel-name">${plant.nombre_planta}</h3>
        <button class="btn btn-ghost" id="btn-close-care">&times;</button>
      </div>
      <img
        class="care-panel-sprite"
        src="${CareDisplayUtils.getPlantSpritePath(plant.sprite_key, 'MUERTA')}"
        onerror="this.src='${CareDisplayUtils.plantPlaceholderPath}'"
        alt="${plant.nombre_planta}"
        style="opacity:0.5; filter:grayscale(1)"
      />
      <div style="text-align:center; padding:1rem; color:var(--color-text-muted)">
        <p style="font-size:1.1rem; margin-bottom:0.5rem">&#9760;&#65039; Planta muerta</p>
        <p style="font-size:0.85rem; line-height:1.5">
          Esta planta no pudo sobrevivir. Revisa tu historial en la
          revisi&oacute;n semanal para identificar qu&eacute; sali&oacute; mal.
        </p>
      </div>
      <button class="btn btn-ghost care-action-btn" id="btn-delete-plant"
              style="width:100%; color:#ef5350; border-color:#ef5350; margin-top:0.5rem">
        &#128465;&#65039; Retirar planta
      </button>
    `
  }
}

window.CarePanelDisplayUtils = CarePanelDisplayUtils
