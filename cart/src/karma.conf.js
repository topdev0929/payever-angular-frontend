const path = require('path');

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    angularCli: {
      environment: 'test'
    },
    preprocessors: {
      '**/src/**/*.ts': 'coverage'
    },
    coverageIstanbulReporter: {
      reporters: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, '../coverage'),
      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
      'report-config': {
        'text-summary': {
          file: path.join(__dirname, '../coverage', 'coverage-summary.txt')
        },
        html: {
          subdir: 'html'
        }
      }
    },
    specReporter: {
      showSpecTiming: true,
      failFast: false // fail test with first report
    },
    reporters: ['spec', 'coverage-istanbul'],
    port: 19876,
    logLevel: config.LOG_INFO,
    browsers: ['HeadlessChrome'],
    customLaunchers: {
      HeadlessChrome: {
        base: 'ChromeHeadless',
        flags: [
          // required to run without privileges in Docker
          '--no-sandbox',

          '--disable-web-security',
          '--disable-gpu',

          // Should speed up tests
          '--proxy-server=\'direct://\'',
          '--proxy-bypass-list=*'
        ]
      }
    },
    browserDisconnectTimeout: 1000 * 60,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 1000 * 60 * 60 * 24,
    autoWatch: false,
    singleRun: true
  });
};
