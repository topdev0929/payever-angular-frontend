import * as path from 'path';

import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import * as webpack from 'webpack';

const config: webpack.Configuration = {
  mode: 'production',

  entry: [ './src/lib/finexp-widget.class.ts' ],

  output: {
    path: path.resolve(__dirname, '../../dist'),
    filename: 'pe-finexp-widget.min.js',
  },

  optimization: {
    minimize: true,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
        extensions: ['.ts'],
      }),
    ],
  },
};

export default config;
