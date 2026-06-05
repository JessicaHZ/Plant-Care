const ProfileConfig = {
  levels: [
    { nivel: 1,  titulo: 'Aprendiz',       xpMin: 0   },
    { nivel: 2,  titulo: 'Cuidador',        xpMin: 100 },
    { nivel: 3,  titulo: 'Jardinero',       xpMin: 250 },
    { nivel: 4,  titulo: 'Botánico',        xpMin: 500 },
    { nivel: 5,  titulo: 'Experto Verde',   xpMin: 900 },
  ],
  achievementCatalog: [
    {
      id:          'primera_planta',
      nombre:      'Primer Brote',
      descripcion: 'Adquiere tu primera planta',
      icono:       '🌱',
      iconKey:     'achievement-first-plant',
      tipo:        'PROGRESO'
    },
    {
      id:          'cinco_plantas',
      nombre:      'Pequeño Jardín',
      descripcion: 'Ten 5 plantas en tu colección',
      icono:       '🪴',
      iconKey:     'achievement-five-plants',
      tipo:        'PROGRESO'
    },
    {
      id:          'primer_nivel',
      nombre:      'Cuidador Novato',
      descripcion: 'Alcanza el nivel 2',
      icono:       '⭐',
      iconKey:     'achievement-level-2',
      tipo:        'PROGRESO'
    },
    {
      id:          'diagnostico_perfecto',
      nombre:      'Ojo Clínico',
      descripcion: 'Acierta 10 diagnósticos previos',
      icono:       '🔍',
      iconKey:     'achievement-diagnosis',
      tipo:        'EDUCATIVO'
    },
    {
      id:          'racha_5',
      nombre:      'Constante',
      descripcion: 'Mantén una racha de 5 días',
      icono:       '🔥',
      iconKey:     'achievement-streak-5',
      tipo:        'RACHA'
    },
    {
      id:          'racha_10',
      nombre:      'Dedicado',
      descripcion: 'Mantén una racha de 10 días',
      icono:       '🔥',
      iconKey:     'achievement-streak-10',
      tipo:        'RACHA'
    },
    {
      id:          'evaluacion_correcta',
      nombre:      'Evaluador Reflexivo',
      descripcion: 'Identifica correctamente la decisión más perjudicial en la revisión semanal',
      icono:       '📊',
      iconKey:     'achievement-weekly-review',
      tipo:        'EVALUACION'
    },
    {
      id:          'sin_errores_semana',
      nombre:      'Semana Perfecta',
      descripcion: 'Completa una semana sin errores de cuidado',
      icono:       '🌟',
      iconKey:     'achievement-perfect-week',
      tipo:        'EDUCATIVO'
    },
    {
      id:          'planta_nivel3',
      nombre:      'Verde Experto',
      descripcion: 'Alcanza el nivel 3',
      icono:       '🏅',
      iconKey:     'achievement-level-3',
      tipo:        'PROGRESO'
    },
    {
      id:          'quiz_perfecto',
      nombre:      'Maestro Botanista',
      descripcion: 'Responde correctamente las 5 preguntas del quiz',
      icono:       '🎓',
      iconKey:     'achievement-quiz-perfect',
      tipo:        'EDUCATIVO'
    },
  ],
  recommendationPatterns: [
    {
      statKey: 'errores_riego',
      message: 'Tu principal patron de error es el riego. Antes de regar, revisa si la humedad esta baja; si la tierra sigue humeda o saturada, espera o drena.'
    },
    {
      statKey: 'errores_abono',
      message: 'Tu principal patron de error es el abono. Usalo cuando los nutrientes esten bajos; abonar demasiado puede estresar las raices.'
    },
    {
      statKey: 'errores_poda',
      message: 'Tu principal patron de error es la poda. Poda solo cuando la planta lo necesite y evita cortar plantas que no requieren esta herramienta.'
    },
    {
      statKey: 'errores_ubicacion',
      message: 'Tu principal patron de error es la ubicacion. Compara la luz requerida por la planta con la luz de cada habitacion antes de colocarla.'
    }
  ],
  defaultRecommendation: 'Aun no hay errores registrados. Manten el habito de observar humedad, nutrientes, luz y necesidad de poda antes de actuar.'
}

window.ProfileConfig = ProfileConfig
