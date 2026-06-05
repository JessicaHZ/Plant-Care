const CareMessagesConfig = {
  contextualGuides: {
    riego: {
      icon: 'ðŸ’§',
      title: 'Sobre el riego',
      steps: [
        'Observa la tierra antes de regar: seca, hÃºmeda o saturada.',
        'Cada planta tiene su propio ritmo. Las suculentas resisten mÃ¡s sequÃ­a que los helechos.',
        'Si la tierra estÃ¡ saturada, no riegues mÃ¡s. Drenar protege las raÃ­ces.',
      ]
    },
    abono: {
      icon: 'ðŸŒ¿',
      title: 'Sobre el abono',
      steps: [
        'Abona cuando la planta muestra desgaste o crecimiento dÃ©bil.',
        'El abono no es un sustituto del riego â€” son necesidades distintas.',
        'Abonar en exceso quema las raÃ­ces y daÃ±a mÃ¡s que ayuda.',
        'Una planta sana no necesita abono inmediato. Observa antes de actuar.',
      ]
    },
    poda: {
      icon: 'âœ‚ï¸',
      title: 'Sobre la poda',
      steps: [
        'La poda sirve para retirar partes secas o controlar crecimiento excesivo.',
        'No podes por rutina: busca seÃ±ales visibles antes de cortar.',
        'Podar sin necesidad estresa a la planta e interrumpe su ciclo de crecimiento.',
        'No todas las plantas se podan â€” las suculentas y cactus generalmente no lo necesitan.',
      ]
    },
    ubicacion: {
      icon: 'ðŸ“',
      title: 'Sobre la ubicaciÃ³n',
      steps: [
        'Cada espacio tiene condiciones de luz distintas: JardÃ­n (directa), Sala y Dormitorio (indirecta).',
        'Coloca plantas de sol en el jardÃ­n o balcÃ³n. Las tropicales prefieren la sala.',
        'Una mala ubicaciÃ³n deteriora la salud lentamente aunque riegues bien.',
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
