const ACHIEVEMENTS = {
  primera_planta: {
    id: 'primera_planta',
    nombre: 'Primer Brote',
    descripcion: 'Adquiere tu primera planta',
    tipo: 'PROGRESO'
  },
  cinco_plantas: {
    id: 'cinco_plantas',
    nombre: 'Pequeño Jardín',
    descripcion: 'Ten 5 plantas en tu colección',
    tipo: 'PROGRESO'
  },
  primer_nivel: {
    id: 'primer_nivel',
    nombre: 'Cuidador Novato',
    descripcion: 'Alcanza el nivel 2',
    tipo: 'PROGRESO'
  },
  planta_nivel3: {
    id: 'planta_nivel3',
    nombre: 'Verde Experto',
    descripcion: 'Alcanza el nivel 3',
    tipo: 'PROGRESO'
  },
  diagnostico_perfecto: {
    id: 'diagnostico_perfecto',
    nombre: 'Ojo Clínico',
    descripcion: 'Acierta 10 diagnósticos previos',
    tipo: 'EDUCATIVO'
  },
  sin_errores_semana: {
    id: 'sin_errores_semana',
    nombre: 'Semana Perfecta',
    descripcion: 'Completa una semana sin errores de cuidado',
    tipo: 'EDUCATIVO'
  },
  racha_5: {
    id: 'racha_5',
    nombre: 'Constante',
    descripcion: 'Mantén una racha de 5 días',
    tipo: 'RACHA'
  },
  racha_10: {
    id: 'racha_10',
    nombre: 'Dedicado',
    descripcion: 'Mantén una racha de 10 días',
    tipo: 'RACHA'
  },
  evaluacion_correcta: {
    id: 'evaluacion_correcta',
    nombre: 'Evaluador Reflexivo',
    descripcion: 'Identifica correctamente la decisión más perjudicial en la revisión semanal',
    tipo: 'EVALUACION'
  },
  quiz_perfecto: {
    id: 'quiz_perfecto',
    nombre: 'Maestro Botanista',
    descripcion: 'Responde correctamente las 5 preguntas del quiz',
    tipo: 'EDUCATIVO'
  }
}

const LEGACY_ACHIEVEMENT_KEYS = {
  'Primer Brote': 'primera_planta',
  'Pequeño Jardín': 'cinco_plantas',
  'Cuidador Novato': 'primer_nivel',
  'Ojo Clínico': 'diagnostico_perfecto',
  'Constante': 'racha_5',
  'Dedicado': 'racha_10',
  'Evaluador Reflexivo': 'evaluacion_correcta',
  'Semana Perfecta': 'sin_errores_semana',
  'Verde Experto': 'planta_nivel3',
  'Maestro Botanista': 'quiz_perfecto'
}

module.exports = {
  ACHIEVEMENTS,
  LEGACY_ACHIEVEMENT_KEYS
}
