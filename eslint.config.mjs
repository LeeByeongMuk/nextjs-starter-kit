import nextVitals from 'eslint-config-next/core-web-vitals';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import boundaries from 'eslint-plugin-boundaries';
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
  // FSD boundaries — warn during Phase B+C migration, promoted to error after Phase C-7
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'app', pattern: 'src/middleware.ts' },
        { type: 'views', pattern: 'src/views/*', mode: 'folder' },
        { type: 'widgets', pattern: 'src/widgets/*', mode: 'folder' },
        { type: 'features', pattern: 'src/features/*', mode: 'folder' },
        { type: 'entities', pattern: 'src/entities/*', mode: 'folder' },
        { type: 'shared', pattern: 'src/shared/**' },
        // legacy locations — removed after Phase C-7
        { type: 'legacy', pattern: 'src/domains/**' },
        { type: 'legacy', pattern: 'src/lib/**' },
        { type: 'legacy', pattern: 'src/tests/**' },
        { type: 'legacy', pattern: 'src/auth.ts' },
      ],
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: true,
      },
    },
    rules: {
      'boundaries/element-types': [
        'warn',
        {
          default: 'allow',
          rules: [
            { from: 'shared', disallow: ['app', 'views', 'widgets', 'features', 'entities'] },
            { from: 'entities', disallow: ['app', 'views', 'widgets', 'features'] },
            { from: 'features', disallow: ['app', 'views', 'widgets', 'features'] },
            { from: 'widgets', disallow: ['app', 'views', 'widgets'] },
            { from: 'views', disallow: ['app', 'views'] },
          ],
        },
      ],
      'boundaries/entry-point': [
        'warn',
        {
          default: 'disallow',
          rules: [
            { target: ['app', 'shared', 'legacy'], allow: '**' },
            { target: ['views', 'widgets', 'features', 'entities'], allow: 'index.{ts,tsx}' },
          ],
        },
      ],
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
    },
  },
  eslintPluginPrettierRecommended,
];
