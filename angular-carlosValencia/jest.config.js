module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^environments/(.*)$': '<rootDir>/src/environments/$1',
    '^@supabase/supabase-js$': '<rootDir>/src/__mocks__/supabase.mock.ts'
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@supabase|isows|@supabase/realtime-js|@supabase/supabase-js)'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/microfrontend-entry.ts',
    '!src/single-spa-entry.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'jsdom'
}; 