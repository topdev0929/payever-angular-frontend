const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  /* TODO: Update to latest Jest snapshotFormat
   * By default Nx has kept the older style of Jest Snapshot formats
   * to prevent breaking of any existing tests with snapshots.
   * It's recommend you update to the latest format.
   * You can do this by removing snapshotFormat property
   * and running tests with --update-snapshot flag.
   * Example: "nx affected --targets=test --update-snapshot"
   * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
   */
  coverageReporters: ['html', 'json-summary', 'lcov'],
  transformIgnorePatterns: ['<rootDir>/node_modules/\\.mjs$'],
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
};
