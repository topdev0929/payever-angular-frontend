module.exports = {
  displayName: 'builder-color-utils',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      astTransformers: {
        before: [
          'jest-preset-angular/build/InlineFilesTransformer',
          'jest-preset-angular/build/StripStylesTransformer',
        ],
      },
    },
  },
  coverageDirectory: '../../../coverage/libs/builder/color-utils',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',  
    'jest-preset-angular/build/serializers/ng-snapshot',  
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
