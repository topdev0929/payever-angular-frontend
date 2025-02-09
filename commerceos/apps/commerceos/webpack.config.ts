import { Configuration } from 'webpack';
import { dependencies as deps } from '../../package.json';
import sharedWebpack from '../../webpack.extra';

const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

export default {
  output: {
    uniqueName: 'main',
    publicPath: 'auto',
  },
  resolve: {
    ...sharedWebpack.resolve,
  },
  plugins: [
    ...sharedWebpack.plugins,
    new ModuleFederationPlugin({
      remotes: {},
      shared: {
        rxjs: {
          singleton: true,
          strictVersion: true,
          requiredVersion: deps.rxjs,
        },
        'rxjs/operators': {
          singleton: true,
          strictVersion: true,
          requiredVersion: deps.rxjs,
        },
      },
    }),
  ],
} as Configuration;
