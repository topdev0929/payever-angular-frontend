import * as path from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
const ExtractTextPlugin = require('extract-text-webpack-plugin');
import * as webpack from 'webpack';

const config: webpack.Configuration = {
  // mode: 'development',
  mode: 'production',

  entry: [ './pe-finexp-widget.ts' ], //  './fin-exp.ts',

  output: {
    path: path.resolve(__dirname, '../../../dist/libs/finexp/widgets'),
    filename: 'pe-finexp-widget.min.js'
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }// ,
      /*
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
        })
        //   ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   use: ['css-loader', 'sass-loader']
        // })
      }*/
    ]
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
        extensions: ['.ts', '.tsx']
      })
    ]
  }
};

export default config;
