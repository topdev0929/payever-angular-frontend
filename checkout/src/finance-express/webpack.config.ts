import * as path from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
const ExtractTextPlugin = require('extract-text-webpack-plugin');
import * as webpack from 'webpack';

const config: webpack.Configuration = {
  mode: 'development',

  entry: [ './fin-exp.ts', './finance_express_embed.scss' ], //  './fin-exp.ts',

  output: {
    path: path.resolve(__dirname, '../../dist'),
    filename: 'finance_express.embed.min.js'
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
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
      }
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
  },

  plugins: [
    new ExtractTextPlugin({
      filename: 'finance_express_embed.css',
      allChunks: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        DEV_SERVER: JSON.stringify(process.env.npm_lifecycle_script.indexOf('webpack-dev-server') >= 0)
      }
    })
  ]
};

export default config;
