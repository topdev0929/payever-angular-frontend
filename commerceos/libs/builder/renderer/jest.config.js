module.exports = {
  displayName: 'builder/renderer',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      astTransformers: {
      },
    },
  },
  coverageDirectory: '../../../coverage/libs/builder/renderer',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',  
    'jest-preset-angular/build/serializers/ng-snapshot',  
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
