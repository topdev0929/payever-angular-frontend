module.exports = {
  displayName: 'builder/context',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      astTransformers: {
      },
    },
  },
  coverageDirectory: '../../../coverage/libs/builder/context',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',  
    'jest-preset-angular/build/serializers/ng-snapshot',  
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
