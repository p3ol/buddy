module.exports = {
  presets: [
    ['@babel/preset-env', {
      corejs: 3,
      useBuiltIns: 'usage',
      modules: false,
    }],
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
  ],
  env: {
    module: {
      presets: [
        ['@babel/preset-env', {
          modules: false,
        }],
      ],
      ignore: ['node_modules/**'],
    },
  },
};
