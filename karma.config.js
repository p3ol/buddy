const path = require('path');
const webpack = require('webpack');

module.exports = config => {
  config.set({
    basePath: './',
    frameworks: [
      'mocha',
    ],
    files: [
      {
        pattern: './src/**/*.js',
        served: true,
      }, {
        pattern: './tests/**/*.js',
        served: true,
      }, {
        pattern: './tests/**/*.html',
        served: true,
      },
    ],
    logLevel: config.LOG_INFO,
    browsers: [
      'PhantomJS',
      'ChromeHeadless',
      'FirefoxHeadless',
    ],
    plugins: [
      'karma-*',
    ],
    singleRun: true,
    colors: true,
    preprocessors: {
      'src/**/*.js': ['webpack', 'coverage'],
      'tests/**/*.js': ['webpack'],
    },
    reporters: ['coverage', 'verbose'],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, 'coverage'),
      combineBrowserReports: true,
    },
    webpack: {
      module: {
        rules: [{
          test: /\.js/,
          exclude: /node_modules/,
          use: [
            { loader: 'babel-loader' },
            {
              loader: 'istanbul-instrumenter-loader',
              query: { esModules: true },
            },
          ],
        }],
      },
      mode: 'production',
      plugins: [
        new webpack.LoaderOptionsPlugin({
          debug: false,
        }),
      ],
      resolve: {
        alias: {
          'fixed-sinon': path.resolve('./node_modules/sinon/pkg/sinon.js'),
        },
      },
    },
  });
};
