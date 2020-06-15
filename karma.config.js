const path = require('path');
const babel = require('@rollup/plugin-babel').default;
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');

module.exports = config => {
  config.set({
    basePath: './',
    frameworks: [
      // 'es6-shim',
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
      'src/**/*.js': ['rollup', 'karma-coverage-istanbul-instrumenter'],
      'tests/**/*.js': ['rollup'],
    },

    reporters: ['coverage-istanbul'],
    coverageIstanbulInstrumenter: {
      produceSourceMap: true,
    },

    rollupPreprocessor: {
      plugins: [
        babel({
          exclude: 'node_modules/**',
          babelHelpers: 'runtime',
        }),
        resolve(),
        commonjs({
          namedExports: {
            chai: ['expect'],
          },
        }),
        alias({
          entries: {
            buddy: path.resolve('./src'),
            'fixed-sinon': path.resolve('./node_modules/sinon/pkg/sinon.js'),
          },
        }),
      ],
      output: {
        format: 'iife',
        name: 'buddyTests',
        sourcemap: true,
      },
      onwarn: warning => {
        if (
          warning.code === 'CIRCULAR_DEPENDENCY' &&
          warning.importer.indexOf('node_modules/chai/lib') === 0
        ) {
          return;
        }

        return warning;
      },
    },
  });
};
