module.exports = {
  env: {
    default: {
      presets: [
        ['@babel/preset-env', {
          corejs: 3,
          useBuiltIns: 'usage',
          targets: {
            browsers: [
              '>=0.2%',
              'not ie >= 0',
              'not ie_mob >= 0',
              'not dead',
            ],
          },
        }],
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', {
          corejs: 3,
        }],
      ],
    },
    ie: {
      presets: [
        ['@babel/preset-env', {
          corejs: 3,
          useBuiltIns: 'usage',
          targets: {
            browsers: [
              '>=0.2%',
              'ie >= 11',
              'not dead',
            ],
          },
        }],
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', {
          corejs: 3,
        }],
      ],
    },
    tests: {
      presets: [],
      plugins: [],
    },
  },
  overrides: [{
    include: /tests\//,
    presets: [
      ['@babel/preset-env', {
        corejs: 3,
        useBuiltIns: 'usage',
      }],
    ],
    plugins: [
      ['@babel/plugin-transform-runtime', {
        corejs: 3,
      }],
    ],
  }],
};
