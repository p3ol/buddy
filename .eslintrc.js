module.exports = {
  extends: ['@poool/eslint-config'],
  parser: '@typescript-eslint/parser',
  overrides: [{
    files: ['tests/**/*.js'],
    env: {
      jest: true,
    },
  }, {
    files: ['src/**/*.{ts,tsx}'],
    extends: ['@poool/eslint-config',
      'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
    },
  }],
};
