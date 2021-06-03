module.exports = {
  extends: ['@poool/eslint-config'],
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        jest: true,
      },
      plugins: [],
      rules: {
        '@babel/no-unused-expressions': 0,
      },
    },
  ],
};
