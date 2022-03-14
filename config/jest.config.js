module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['<rootDir>/{api,app,common}/{helpers,hooks,libs}/**/*.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      // https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/#manual-configuration
      useESM: true,
    },
  },
  maxWorkers: '50%',
  moduleNameMapper: {
    // https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/#manual-configuration
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@api/(.*)$': '<rootDir>/api/$1',
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
  },
  preset: 'ts-jest/presets/js-with-ts-esm',
  rootDir: '..',
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
  testMatch: ['**/*.test.ts'],
  transformIgnorePatterns: ['/node_modules/(?!bhala)'],
}
