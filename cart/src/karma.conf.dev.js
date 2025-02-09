const mainConfig = require('./karma.conf');

module.exports = function (config) {
  mainConfig(config);

  config.set({
    browsers: ['Chrome'],

    // logLevel: config.LOG_DEBUG,

    reporters: ['spec', 'kjhtml', 'coverage-istanbul'],
    autoWatch: true,
    singleRun: false,
    colors: true
  });
};
