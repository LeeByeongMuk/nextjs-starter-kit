process.env.APP_API_URL = 'http://localhost:9090';

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^next-auth/react$': '<rootDir>/src/shared/lib/testing/nextAuthReact.tsx',
  },
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

const extraTransformPkgs = [
  'rettime',
  'until-async',
  'next-auth',
  '@auth',
  'msw',
  '@msw',
  '@mswjs',
  '@open-draft',
  // msw가 쓰는 cookie 2는 node_modules/msw 아래에 중첩 설치된다. 예외는 경로의 node_modules 구간마다 판정하므로 안쪽 패키지 이름도 둔다.
  'cookie',
];

const nextConfig = createJestConfig(config);

const jestConfig = async () => {
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

export default jestConfig;
