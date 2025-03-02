module.exports = {
  displayName: 'builder/animations',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      astTransformers: {
      },
    },
  },
  coverageDirectory: '../../../coverage/libs/builder/animations',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',  
    'jest-preset-angular/build/serializers/ng-snapshot',  
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
