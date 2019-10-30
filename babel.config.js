module.exports = {
  presets: [
    ['@babel/env', {
      corejs: 3,
      useBuiltIns: 'usage',
      modules: false,
    }],
  ],
  plugins: [
    '@babel/proposal-object-rest-spread',
  ],
  env: {
    module: {
      presets: [
        ['@babel/env', {
          modules: false,
        }],
      ],
      ignore: ['node_modules/**'],
    },
    tests: {
      plugins: [
        ['@babel/transform-runtime', {
          regenerator: true,
        }],
      ],
    },
  },
};
