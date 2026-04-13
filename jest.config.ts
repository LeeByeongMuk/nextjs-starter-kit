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
    '^next-auth/react$': '<rootDir>/src/shared/lib/testing/nextAuthReact.tsx',
  },
  preset: 'ts-jest',
  rootDir: './',
  testEnvironment: 'jest-fixed-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
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

// Packages that ship ESM and need Jest transformation
const extraTransformPkgs = ['rettime', 'until-async', 'next-auth', '@auth'];

const nextConfig = createJestConfig(config);

export default async () => {
  const resolved = await nextConfig();
  if (resolved.transformIgnorePatterns) {
    const pkgList = extraTransformPkgs.join('|');
    resolved.transformIgnorePatterns = resolved.transformIgnorePatterns.map(
      (pattern: string) => {
        if (!pattern.includes('node_modules')) return pattern;
        return pattern.replaceAll('(geist|', `(${pkgList}|geist|`);
      }
    );
  }
  return resolved;
};
