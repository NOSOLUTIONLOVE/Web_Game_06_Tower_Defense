/* ESLint 配置文件 - React + TypeScript */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-refresh'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',

    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'warn',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.ts',
    '*.config.cjs',
    '*.config.js',
    'src/engine/__tests__/',
  ],
};
