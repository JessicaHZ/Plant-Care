const DiagnosisConfig = {
  actionLabels: {
    water: 'Regar',
    fertilize: 'Abonar',
    prune: 'Podar',
    drain: 'Drenar'
  },

  scenarios: {
    WATER_LUZ_INCORRECTA: {
      question:    'Antes de regar, que otra causa podria explicar el deterioro?',
      situation:   'La planta no mejora aunque el problema no parece ser solo falta de agua.',
      options: [
        'Revisar si la luz del lugar coincide con la planta',
        'Regar mas para compensar cualquier problema',
        'Podarla aunque no tenga hojas secas'
      ],
      correctIndex: 0,
      explanation:  'No todos los problemas se resuelven con agua. Si la luz no coincide, la planta puede perder salud lentamente.'
    },
    FERTILIZE_NUTRIENTES_BAJOS: {
      question:    'Cuando conviene aplicar abono?',
      situation:   'La planta muestra desgaste gradual y el sustrato podria necesitar apoyo.',
      options: [
        'Cuando los nutrientes estan bajos o la recuperacion se vuelve lenta',
        'Siempre que la planta se vea sana',
        'Cada vez que se riega'
      ],
      correctIndex: 0,
      explanation:  'El abono es una ayuda gradual. Funciona mejor cuando el sustrato esta pobre, no como rutina permanente.'
    },
    FERTILIZE_NUTRIENTES_EXCESO: {
      question:    'Que riesgo tiene abonar sin necesidad?',
      situation:   'La planta ya tiene suficiente alimento en el sustrato.',
      options: [
        'Puede estresar las raices; es mejor esperar',
        'Acelera siempre el crecimiento',
        'Corrige problemas de luz'
      ],
      correctIndex: 0,
      explanation:  'El exceso de nutrientes tambien es un error de cuidado. Observar antes de abonar evita estresar la raiz.'
    },
    FERTILIZE_NUTRIENTES_ADECUADOS: {
      question:    'Que conviene hacer antes de abonar?',
      situation:   'El sustrato aun conserva nutrientes suficientes.',
      options: [
        'Esperar a que los nutrientes bajen o la planta muestre desgaste',
        'Abonar ahora para acelerar siempre el crecimiento',
        'Regar mas para activar el abono'
      ],
      correctIndex: 0,
      explanation:  'El abono funciona mejor cuando la planta lo necesita. Aplicarlo por rutina puede saturar el sustrato.'
    },
    FERTILIZE_NO_CORRIGE_OTRO_PROBLEMA: {
      question:    'Que debes revisar antes de usar abono?',
      situation:   'La planta esta deteriorada, pero los nutrientes no parecen ser el problema principal.',
      options: [
        'Confirmar si el desgaste viene de luz, riego o salud antes de abonar',
        'Abonar de todas formas porque cura cualquier problema',
        'Podarla para que el abono funcione mas rapido'
      ],
      correctIndex: 0,
      explanation:  'El abono no corrige todos los problemas. Si los nutrientes estan bien, conviene revisar otras senales.'
    },
    PRUNE_NECESARIA: {
      question:    'Que senal justifica usar la poda?',
      situation:   'La planta muestra senales de que podria beneficiarse de un corte cuidadoso.',
      options: [
        'Retirar hojas secas o crecimiento deteriorado para concentrar energia',
        'Cortar hojas sanas para que crezca mas rapido',
        'Podar cualquier planta una vez por semana'
      ],
      correctIndex: 0,
      explanation:  'La poda debe tener proposito. Quitar partes deterioradas ayuda, pero cortar sin necesidad estresa la planta.'
    },
    PRUNE_NO_NECESARIA: {
      question:    'Que conviene hacer si una planta no necesita poda?',
      situation:   'La planta no muestra senales claras para cortar.',
      options: [
        'Esperar y observar antes de podar',
        'Podarla para prevenir cualquier problema',
        'Abonarla para reemplazar la poda'
      ],
      correctIndex: 0,
      explanation:  'Podar sin necesidad puede debilitar una planta sana. La observacion tambien es una decision de cuidado.'
    },
    WATER_TIERRA_OPTIMA: {
      question:    'Que indica una humedad adecuada antes de regar?',
      situation:   'La tierra aun esta en un rango saludable para esta planta.',
      options: [
        'Esperar y revisar mas tarde antes de agregar agua',
        'Regar ahora para mantenerla siempre al maximo',
        'Abonar para que absorba mejor el agua'
      ],
      correctIndex: 0,
      explanation:  'Regar cuando la humedad ya es adecuada puede llevar a exceso de agua. Observar tambien es cuidar.'
    },
    SANA_EXCESO_AGUA: {
      question:    '¿Qué deberías hacer si la tierra está saturada?',
      situation:   'Tu planta tiene buen aspecto, pero la tierra está demasiado húmeda.',
      options: [
        'Drenar el exceso inclinando la maceta y secando el sustrato',
        'Regar de todas formas — siempre necesita agua',
        'Aplicar abono para compensar el daño del exceso'
      ],
      correctIndex: 0,
      explanation:  'El exceso de agua deja a las raíces sin aire. Drenar ayuda a retirar el sobrante.',
      onCorrect:    'drain'
    },
    SANA_NECESITA_AGUA: {
      question:    '¿Qué indica la tierra seca?',
      situation:   'Tu planta luce bien, pero la tierra empieza a secarse.',
      options: [
        'La humedad está baja — pronto necesitará agua',
        'Está perfecta, no necesita nada',
        'Necesita abono para compensar la falta de agua'
      ],
      correctIndex: 0,
      explanation:  'La tierra seca es una señal temprana. Regar a tiempo evita que la planta se marchite.'
    },
    SANA: {
      question:    '¿Qué acción es más adecuada para una planta saludable?',
      situation:   'Tu planta tiene buen color y aspecto saludable.',
      options: [
        'Regar aunque no lo necesite, para asegurarme',
        'Observar y actuar solo si muestra señales de necesidad',
        'Aplicar abono para que crezca más rápido'
      ],
      correctIndex: 1,
      explanation:  'Una planta sana también necesita observación. Actuar sin señales puede causar estrés.'
    },
    MARCHITA_EXCESO: {
      question:    '¿Por qué puede marchitarse una planta con la tierra mojada?',
      situation:   'Tu planta está marchita y la tierra sigue muy húmeda.',
      options: [
        'Le falta agua — debo regar más',
        'Tiene exceso de agua — las raíces no pueden respirar',
        'Necesita poda urgente para recuperarse'
      ],
      correctIndex: 1,
      explanation:  'Con demasiada agua, las raíces no respiran bien. Drena o deja secar antes de volver a regar.',
      onCorrect:    'drain'
    },
    MARCHITA: {
      question:    '¿Qué crees que necesita tu planta ahora?',
      situation:   'Tu planta tiene hojas caídas y aspecto marchito.',
      options: [
        'Le falta agua — necesita riego urgente',
        'Tiene exceso de agua — debo esperar',
        'Necesita más luz solar directa'
      ],
      correctIndex: 0,
      explanation:  'Las hojas caídas con tierra seca suelen indicar sed. Un riego cuidadoso puede ayudarla.'
    },
    ENFERMA_EXCESO: {
      question:    '¿Qué problema identificas en tu planta enferma?',
      situation:   'Tu planta tiene manchas, hojas amarillas y tierra saturada.',
      options: [
        'Falta de nutrientes — necesita abono urgente',
        'Exceso de riego prolongado — raíces dañadas',
        'Falta de luz — debo cambiarla de lugar'
      ],
      correctIndex: 1,
      explanation:  'Manchas y tierra saturada pueden indicar raíces dañadas. Retira el exceso de agua.',
      onCorrect:    'drain'
    },
    ENFERMA: {
      question:    '¿Qué problema identificas en tu planta?',
      situation:   'Tu planta tiene hojas amarillas y manchas oscuras.',
      options: [
        'Falta de nutrientes — necesita abono',
        'Exceso de riego — raíces posiblemente dañadas',
        'Falta de poda — hojas secas acumuladas'
      ],
      correctIndex: 1,
      explanation:  'Las manchas oscuras suelen aparecer cuando la planta ha pasado por estrés. Observa la tierra antes de actuar.'
    },
    MUERTA: {
      question:    '¿Qué le ocurrió a esta planta?',
      situation:   'Tu planta no tiene señales de vida.',
      options: [
        'Murió por falta de riego prolongada',
        'Murió por exceso de agua y pudrición',
        'No es posible saberlo sin más información'
      ],
      correctIndex: 2,
      explanation:  'Una planta puede morir por varias causas. La revisión semanal ayuda a encontrar el patrón.'
    }
  },
  getActionLabel(actionType) {
    return this.actionLabels[actionType] || 'actuar'
  }
}

window.DiagnosisConfig = DiagnosisConfig
