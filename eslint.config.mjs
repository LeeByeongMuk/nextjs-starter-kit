import nextVitals from 'eslint-config-next/core-web-vitals';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

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
    rules: {
      'no-alert': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': ['warn'],
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], 'internal', 'parent', ['sibling', 'index'], 'object'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      complexity: 'warn',
    },
  },
  eslintPluginPrettierRecommended,
];
