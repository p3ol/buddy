module.exports = {
  presets: [
    ['@babel/env', {
      corejs: 3,
      useBuiltIns: 'usage',
    }],
  ],
  plugins: [
    '@babel/proposal-object-rest-spread',
  ],
  env: {
    tests: {
      sourceMap: true,
    },
  },
};
