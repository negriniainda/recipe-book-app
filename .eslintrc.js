module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': ['warn'],
        'react-hooks/exhaustive-deps': 'warn',
        'react-native/no-inline-styles': 'off',
      },
    },
  ],
  rules: {
    'prettier/prettier': 'off',
    'react-native/no-inline-styles': 'off',
    'no-console': 'warn',
    'no-unused-vars': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'coverage/',
    'e2e/',
    '*.config.js',
  ],
};