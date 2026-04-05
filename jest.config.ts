process.env.APP_API_URL = 'http://localhost:9090';

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next-auth/react$': '<rootDir>/src/tests/mocks/nextAuthReact.tsx',
  },
  preset: 'ts-jest',
  rootDir: './',
  testEnvironment: 'jest-fixed-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  transformIgnorePatterns: ['/node_modules/(?!(next-auth|@auth/core)/)'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  coverageDirectory: 'coverage',
};

export default createJestConfig(config);
