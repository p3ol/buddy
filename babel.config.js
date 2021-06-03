module.exports = {
  env: {
    default: {
      presets: [
        ['@babel/preset-env', {
          corejs: 3,
          useBuiltIns: 'usage',
          targets: {
            browsers: [
              'last 2 versions',
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
              'last 2 versions',
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
    test: /.test.js$/,
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
