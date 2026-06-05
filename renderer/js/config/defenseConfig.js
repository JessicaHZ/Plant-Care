const DefenseConfig = {
  maxSpeed: 2.5,

  pests: [
    { name: 'Pulgon', label: '&#x1FAB2;', xp: 4, speed: 1.0, size: 38, behavior: 'direct' },
    { name: 'Cochinilla', label: '&#x1FAB3;', xp: 6, speed: 0.5, size: 46, behavior: 'direct' },
    { name: 'Acaro', label: '&#x1F577;&#xFE0F;', xp: 5, speed: 1.8, size: 32, behavior: 'direct' },
    { name: 'Mosca', label: '&#x1FAB0;', xp: 5, speed: 2.2, size: 30, behavior: 'zigzag' },
    { name: 'Oruga', label: '&#x1F41B;', xp: 8, speed: 0.3, size: 48, behavior: 'direct' },
    { name: 'Hormiga', label: '&#x1F41C;', xp: 3, speed: 2.0, size: 28, behavior: 'direct' }
  ],

  allies: [
    { name: 'Mariquita', label: '&#x1F41E;', speed: 1.2, size: 36 },
    { name: 'Abeja', label: '&#x1F41D;', speed: 1.8, size: 32 },
    { name: 'Mariposa', label: '&#x1F98B;', speed: 2.4, size: 40 },
    { name: 'Mantis', label: '&#x1F997;', speed: 0.9, size: 38 }
  ],

  waves: [
    { pests: 5, spawnMs: 1300 },
    { pests: 7, spawnMs: 1050 },
    { pests: 9, spawnMs: 860 },
    { pests: 11, spawnMs: 720 },
    { pests: 14, spawnMs: 580 }
  ]
}

window.DefenseConfig = DefenseConfig
