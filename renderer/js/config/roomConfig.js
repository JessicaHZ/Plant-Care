const RoomConfig = {
  rooms: {
    'SALA': { label: 'Sala', icon: '🛋️', luz: 'INDIRECTA', sprite: 'sala' },
    'JARDÍN': { label: 'Jardín', icon: '🌳', luz: 'DIRECTA', sprite: 'jardin' },
    'DORMITORIO': { label: 'Dormitorio', icon: '🛏️', luz: 'INDIRECTA', sprite: 'dormitorio' }
  },

  // Slots fijos por habitación (coordenadas en % sobre room-area).
  slots: {
    'JARDÍN': [
      { id: 'jardin-1', x: 70, y: 34.1 },
      { id: 'jardin-2', x: 62.5, y: 25.8 },
      { id: 'jardin-3', x: 43.8, y: 61.6 },
      { id: 'jardin-4', x: 51.1, y: 29.7 },
      { id: 'jardin-5', x: 58.5, y: 39.2 },
      { id: 'jardin-6', x: 65.9, y: 45 },
      { id: 'jardin-7', x: 25.3, y: 45.3 },
      { id: 'jardin-8', x: 16.6, y: 52.7 },
      { id: 'jardin-9', x: 50.9, y: 52.7 },
      { id: 'jardin-10', x: 52.1, y: 72.1 },
      { id: 'jardin-11', x: 59, y: 60.4 },
    ],
    'SALA': [
      { id: 'sala-1', x: 55.5, y: 74.7 },
      { id: 'sala-2', x: 80.8, y: 75.3 },
      { id: 'sala-3', x: 45.9, y: 56.7 },
      { id: 'sala-4', x: 56.5, y: 56.9 },
      { id: 'sala-5', x: 67.8, y: 57 },
      { id: 'sala-6', x: 89.9, y: 94.5 },
    ],
    'DORMITORIO': [
      { id: 'dorm-1', x: 40.3, y: 33.6 },
      { id: 'dorm-2', x: 33.8, y: 58.2 },
      { id: 'dorm-3', x: 88.5, y: 53.7 },
      { id: 'dorm-4', x: 16, y: 74.6 },
      { id: 'dorm-5', x: 49.4, y: 26 },
    ],
  }
}

window.RoomConfig = RoomConfig
