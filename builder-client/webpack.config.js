const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const args = require('yargs').argv;
const mode = args.mode;

const entry = {
  'dist/server/server': './ssr/server.ts',
  'dist/server/consumer': './ssr/consumer/entries/rmq-consumer.ts',
};

if (mode === 'development') {
  entry['dist/server/dev-consumer'] = './ssr/consumer/entries/dev-consumer.ts';
}

/**
 * This is a server config which should be merged on top of common config
 */
module.exports = {
  mode: 'development',
  watch: false,
  devtool: 'eval',
  externals: [/(node_modules|main\..*\.js)/],
  entry: entry,
  resolve: { extensions: ['.js', '.ts'] },
  output: {
    // Puts the output at the root of the dist folder
    path: path.join(__dirname),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        include: path.resolve(__dirname, 'ssr'),
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {}, // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
      {},
    ),
    // Without this row - build error
    new webpack.IgnorePlugin(/vertx/)
  ],
  target: 'node',
  node: {
    __dirname: false,
  },
};
