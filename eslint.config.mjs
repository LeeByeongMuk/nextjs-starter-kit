import tanstackQuery from '@tanstack/eslint-plugin-query';
import nextVitals from 'eslint-config-next/core-web-vitals';
import boundaries from 'eslint-plugin-boundaries';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

import fsd from './eslint-rules/fsd-relative-imports.mjs';

export default [
  {
    ignores: [
      '.next/**',
      '.build/**',
      'build/**',
      'next-env.d.ts',
      'yarn.lock',
      'public/**',
      'next.config.js',
      'README.md',
      'Dockerfile',
      '.nvmrc',
      '.vscode/**',
      '.idea/**',
      '.yarn/**',
      '.pnp.*',
      'jest.setup.ts',
      'jest.polyfills.js',
    ],
  },
  ...nextVitals,
  ...tanstackQuery.configs['flat/recommended'],
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-alert': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off',
      complexity: 'warn',
    },
  },
  // @typescript-eslint 플러그인은 nextVitals가 ts/tsx에만 등록하므로 별도 스코프
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': ['warn'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['interface', 'typeAlias', 'class', 'enum'],
          format: ['PascalCase'],
          custom: { regex: '^(I|T)[A-Z]', match: false },
        },
      ],
    },
  },
  // FSD boundaries — layer direction + public API (boundaries v7 syntax)
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries, fsd },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'views', pattern: 'src/views/*' },
        { type: 'widgets', pattern: 'src/widgets/*' },
        { type: 'features', pattern: 'src/features/*' },
        { type: 'entities', pattern: 'src/entities/*' },
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'styles', pattern: 'src/styles/**' },
      ],
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: true,
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            // 레이어 방향: 상→하 단방향만 허용
            {
              from: { element: { type: 'shared' } },
              disallow: {
                to: {
                  element: {
                    type: ['app', 'views', 'widgets', 'features', 'entities'],
                  },
                },
              },
            },
            {
              from: { element: { type: 'entities' } },
              disallow: {
                to: {
                  element: { type: ['app', 'views', 'widgets', 'features'] },
                },
              },
            },
            // 같은 레이어 형제 슬라이스 import 금지 포함 (features→features, views→views)
            {
              from: { element: { type: 'features' } },
              disallow: {
                to: {
                  element: { type: ['app', 'views', 'widgets', 'features'] },
                },
              },
            },
            {
              from: { element: { type: 'widgets' } },
              disallow: {
                to: { element: { type: ['app', 'views', 'widgets'] } },
              },
            },
            {
              from: { element: { type: 'views' } },
              disallow: { to: { element: { type: ['app', 'views'] } } },
            },
            // Public API: 슬라이스 레이어는 index.{ts,tsx}로만 진입 (deep import 금지)
            {
              from: { element: { type: '*' } },
              disallow: {
                to: {
                  element: {
                    type: ['views', 'widgets', 'features', 'entities'],
                    fileInternalPath: '!index.{ts,tsx}',
                  },
                },
              },
            },
          ],
        },
      ],
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/no-unknown-files': 'error',
      // 같은 슬라이스 내부에서는 alias 대신 상대 경로
      'fsd/relative-imports': 'error',
    },
  },
  // src/middleware.ts는 Next.js 고정 경로의 단일 파일 — v7 elements는 폴더만
  // 매칭하므로 app 레이어로 분류할 수 없어 unknown-files 검사만 제외한다
  {
    files: ['src/middleware.ts'],
    rules: { 'boundaries/no-unknown-files': 'off' },
  },
  eslintPluginPrettierRecommended,
];
