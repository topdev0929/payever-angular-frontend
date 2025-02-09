const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = webpackMerge(require('../webpack.config'), {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings   : false,
        keep_fnames: true
      },
      mangling: false
    })
  ],
});
