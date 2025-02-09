import { dependencies } from 'package.json';
import { Configuration, container } from 'webpack';

import sharedWebpack from '../../webpack-extra.config';

export default {
  output: {
    uniqueName: 'checkoutWrapperCe',
    publicPath: 'auto',
    scriptType: 'text/javascript',
  },
  optimization: {
    runtimeChunk: false,
    minimize: true,
  },
  resolve: {
    ...sharedWebpack.resolve,
  },
  plugins: [
    ...sharedWebpack.plugins,
    new container.ModuleFederationPlugin({
      name: 'checkoutWrapperCe',
      filename: 'remoteEntry.js',
      exposes: {
        customElements: 'apps/custom-elements/src/bootstrap.ts',
        skeleton: 'libs/lazy/web-components/skeleton/loader.js',
      },
      shared: {
        rxjs: {
          singleton: true,
          strictVersion: false,
          requiredVersion: dependencies.rxjs,
        },
        'rxjs/operators': {
          singleton: true,
          strictVersion: false,
          requiredVersion: dependencies.rxjs,
        },
      },
    }),
  ],
} as Configuration;
