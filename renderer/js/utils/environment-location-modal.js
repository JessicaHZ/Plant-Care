const EnvironmentLocationModal = {
  askPlacementQuestion(plantName, room) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div')
      overlay.className = 'diagnosis-overlay'
      overlay.innerHTML = EnvironmentDisplayUtils.getLocationQuestionHTML(plantName, room)
      document.body.appendChild(overlay)

      overlay.querySelectorAll('button[data-answer]').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.remove()
          resolve(btn.dataset.answer)
        })
      })
    })
  },

  showPlacementResult({ plantName, room, actualLight }) {
    const overlay = document.createElement('div')
    overlay.className = 'diagnosis-overlay'
    overlay.innerHTML = EnvironmentDisplayUtils.getLocationResultHTML({
      plantName,
      room,
      actualLight
    })
    document.body.appendChild(overlay)

    overlay.querySelector('#btn-close-location-result')
      .addEventListener('click', () => overlay.remove())
  }
}

window.EnvironmentLocationModal = EnvironmentLocationModal
