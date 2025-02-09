import { Configuration } from 'webpack';

const DeterministicModuleIdsPlugin = require('webpack/lib/ids/DeterministicModuleIdsPlugin');

export default {
  output: {
    uniqueName: 'pe-message-embed',
  },
  optimization: {
    moduleIds: false,
  },
  plugins: [
    new DeterministicModuleIdsPlugin({
      maxLength: 6,
    }),
  ],
} as Configuration;
