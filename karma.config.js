module.exports = config => {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: './',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: [
      'mocha',
    ],

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: 'dist/buddy.js',
        served: true,
        nocache: true,
      }, {
        pattern: 'dist/**/*',
        included: false,
        served: true,
        watched: false,
        nocache: true,
      }, {
        pattern: 'tests/**/*.test.js',
        watched: false,
        included: true,
        served: true,
      }, {
        pattern: 'tests/**/*.html',
        watched: false,
        included: false,
        served: true,
      },
    ],

    // list of files / patterns to exclude
    exclude: [],

    // level of logging
    // possible values:
    // LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS',
      'ChromeHeadless',
      'FirefoxHeadless',
    ],

    // Which plugins to enable
    plugins: [
      'karma-rollup-preprocessor',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,
    colors: true,
    autoWatch: true,
    client: {
      captureConsole: false,
    },

    preprocessors: {
      'tests/**/*.test.js': ['rollup'],
    },

    rollupPreprocessor: {
      plugins: [
        require('rollup-plugin-babel')({
          exclude: /node_modules/,
          runtimeHelpers: true,
        }),
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-commonjs')({
          namedExports: {
            chai: ['expect'],
          },
        }),
      ],
      output: {
        format: 'iife',
        name: 'buddyTests',
        sourcemap: 'inline',
      },
      onwarn: (warning) => {
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
