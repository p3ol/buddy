module.exports = {
  extends: ['@poool/eslint-config'],
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        browser: true,
        es6: true,
        mocha: true,
      },
      plugins: [
        'mocha',
      ],
      rules: {
        '@babel/no-unused-expressions': 0,
      },
    },
  ],
};
