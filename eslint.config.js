import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        __DEV__: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true,
        'args': 'after-used'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-unused-vars': 'off', // Desabilitar a regra base em favor da do TypeScript
    },
  },
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
      '.prettierrc.js',
    ],
  },
];