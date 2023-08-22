module.exports = {
  extends: ['@poool/eslint-config'],
  overrides: [{
    files: ['tests/**/*.js'],
    env: {
      jest: true,
    },
  }, {
    files: ['src/**/*.{ts,tsx}'],
    extends: ['plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
    },
  }],
};
