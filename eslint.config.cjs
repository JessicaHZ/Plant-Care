const js = require('@eslint/js')

const commonGlobals = {
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly'
}

const nodeGlobals = {
  ...commonGlobals,
  require: 'readonly',
  module: 'readonly',
  exports: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  process: 'readonly',
  Buffer: 'readonly'
}

const browserGlobals = {
  ...commonGlobals,
  window: 'readonly',
  document: 'readonly',
  CustomEvent: 'readonly',
  Event: 'readonly',
  HTMLElement: 'readonly',
  HTMLButtonElement: 'readonly',
  Image: 'readonly',
  localStorage: 'readonly',
  navigator: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  alert: 'readonly'
}

const rendererAppGlobals = {
  CareActions: 'readonly',
  Diagnosis: 'readonly',
  Environment: 'readonly',
  Guide: 'readonly',
  MiniGameDefense: 'readonly',
  MiniGamePruning: 'readonly',
  MiniGameQuiz: 'readonly',
  Nursery: 'readonly',
  NumberUtils: 'readonly',
  PlayerHUD: 'readonly',
  ProfileScreen: 'readonly',
  ScreenManager: 'readonly',
  Simulation: 'readonly',
  SlotEditor: 'readonly',
  Tutorial: 'readonly',
  WeeklyReview: 'readonly'
}

const baseRules = {
  'no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }
  ],
  'no-console': 'off',
  'no-empty': ['warn', { allowEmptyCatch: true }],
  eqeqeq: ['warn', 'smart'],
  curly: ['warn', 'multi-line'],
  'no-var': 'warn',
  'prefer-const': 'warn'
}

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'out/**',
      'coverage/**',
      'assets/**',
      '*.db',
      '*.sqlite',
      '*.sqlite3',
      'package-lock.json'
    ]
  },
  js.configs.recommended,
  {
    files: ['main/**/*.js', 'eslint.config.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: nodeGlobals
    },
    rules: baseRules
  },
  {
    files: ['renderer/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...browserGlobals,
        ...rendererAppGlobals
      }
    },
    rules: {
      ...baseRules,
      'no-redeclare': 'off'
    }
  }
]
