const path = require('path');

// Using Puppeteer (Headless Chrome, https://pptr.dev/)
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  const coverageReporterPath = path.join(__dirname, 'coverage');

  config.set({
    basePath: '/',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-spec-reporter'),
      require('karma-remap-istanbul'),
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-chrome-launcher'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: coverageReporterPath,
      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
      thresholds: {
        emitWarning: false,
        global: {
          statements: 10,
          lines: 10,
          branches: 10,
          functions: 10
        }
      }
    },
    remapIstanbulReporter: {
      timeoutNotCreated: 5000,
      timeoutNoMoreFiles: 1000
    },
    angularCli: {
      environment: 'test'
    },
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
    reporters: [
      'spec',
      'kjhtml',
      'karma-remap-istanbul'
    ],
    specReporter: {
      showSpecTiming: true,
      failFast: false // fail test with first report
    },
    colors: true,
    port: 9876,
    logLevel: config.LOG_INFO,
    browserDisconnectTimeout: 1000 * 60 * 10,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 1000 * 60 * 60 * 24,
    autoWatch: true,
    singleRun: true
  });
};
