const CareMessagesConfig = {
  contextualGuides: {
    riego: {
      icon: '💧',
      title: 'Sobre el riego',
      steps: [
        'Observa la tierra antes de regar: seca, húmeda o saturada.',
        'Cada planta tiene su propio ritmo. Las suculentas resisten más sequía que los helechos.',
        'Si la tierra está saturada, no riegues más. Drenar protege las raíces.',
      ]
    },
    abono: {
      icon: '🌿',
      title: 'Sobre el abono',
      steps: [
        'Abona cuando la planta muestra desgaste o crecimiento débil.',
        'El abono no es un sustituto del riego - son necesidades distintas.',
        'Abonar en exceso quema las raíces y daña más que ayuda.',
        'Una planta sana no necesita abono inmediato. Observa antes de actuar.',
      ]
    },
    poda: {
      icon: '✂️',
      title: 'Sobre la poda',
      steps: [
        'La poda sirve para retirar partes secas o controlar crecimiento excesivo.',
        'No podes por rutina: busca señales visibles antes de cortar.',
        'Podar sin necesidad estresa a la planta e interrumpe su ciclo de crecimiento.',
        'No todas las plantas se podan - las suculentas y cactus generalmente no lo necesitan.',
      ]
    },
    ubicacion: {
      icon: '📍',
      title: 'Sobre la ubicación',
      steps: [
        'Cada espacio tiene condiciones de luz distintas: Jardín (directa), Sala y Dormitorio (indirecta).',
        'Coloca plantas de sol en el jardín o balcón. Las tropicales prefieren la sala.',
        'Una mala ubicación deteriora la salud lentamente aunque riegues bien.',
        'Puedes mover una planta en cualquier momento desde su panel de cuidado.',
      ]
    }
  },

  guideHints: {
    riego: {
      mood: 'worried',
      message: 'Creo que estas regando demasiado seguido. Observa si la tierra sigue humeda antes de actuar.'
    },
    abono: {
      mood: 'thinking',
      message: 'El abono ayuda al crecimiento, pero no corrige todos los problemas.'
    },
    poda: {
      mood: 'warning',
      message: 'Esa planta no necesitaba poda todavia. Espera senales visibles antes de cortar.'
    },
    ubicacion: {
      mood: 'thinking',
      message: 'La luz del lugar importa. Prueba ubicar la planta donde reciba el tipo de luz que necesita.'
    }
  }
}

window.CareMessagesConfig = CareMessagesConfig
