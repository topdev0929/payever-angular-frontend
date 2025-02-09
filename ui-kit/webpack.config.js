const ENV = process.env.NODE_ENV || 'development';
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = require('./configs/webpack-settings.config');

module.exports = webpackMerge(config, {
  entry: {
    /* COMMON JS LIBRARIES */
    common: [
      /* Polyfills for Safari 7&8, IE10&11, Android 4.1+ */
      'core-js/client/shim',
      'zone.js/dist/zone',

      /* COMMON @Angular COMPONENTS AND LIBRARIES */
      '@angular/core',
      '@angular/common',
      '@angular/compiler',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/router',

      'expose-loader?$!expose-loader?jQuery!jquery',
      'jquery.finger/dist/jquery.finger',
    ],

    doc: [
      './src/doc/app.ts',
      './src/doc/styles.scss'
    ]
  },

  output: {
    path      : __dirname + '/dist/ui-kit/',
    publicPath: '/ui-kit/',
    filename  : '[name].js',
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify(ENV),
      }
    }),
    new HtmlWebpackPlugin({
      chunks: [
        'doc'
      ],
      template: './src/doc/index.ejs',
      filename: 'index.html',
      baseUrl: '/ui-kit/',
    }),
    new CopyWebpackPlugin([
      {from: 'doc-assets', to: 'doc-assets'},
      {from: 'src/doc/assets', to: 'assets'}
    ]),

    // Fix for WARNING in ./~/@angular/core/src/linker/system_js_ng_module_factory_loader.js
    // TODO: change Regexp to `/angular(\\|\/)core(\\|\/)@angular/` when move to Angular4+
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      path.resolve(__dirname, '../src')
    )
  ]
});
