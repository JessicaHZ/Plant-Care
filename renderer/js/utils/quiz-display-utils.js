const QuizDisplayUtils = {
  getAnswerFeedbackTitle(isCorrect) {
    return isCorrect ? 'Correcto' : 'Incorrecto'
  },

  getNextButtonLabel(isLastQuestion) {
    return isLastQuestion ? 'Ver resultado' : 'Siguiente'
  },

  getStreakNoteHTML(hasCorrectAnswers) {
    return hasCorrectAnswers
      ? '<p class="result-streak">Tu respuesta correcta conto para la racha de hoy.</p>'
      : ''
  },

  getResultLevel(percentage) {
    if (percentage >= 80) {
      return {
        icon: '*',
        message: 'Excelente dominio de conceptos de cuidado vegetal.'
      }
    }

    if (percentage >= 60) {
      return {
        icon: '+',
        message: 'Buen resultado. Sigue practicando para reforzar decisiones de cuidado.'
      }
    }

    return {
      icon: '!',
      message: 'Hay conceptos por reforzar. Revisa riego, luz, sustrato y poda.'
    }
  }
}

window.QuizDisplayUtils = QuizDisplayUtils
