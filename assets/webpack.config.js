const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: './scripts/tool-bar.ts',
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'demo.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './assets', to: 'assets' },
        { from: './scripts/locale', to: 'scripts/locale' },
        { from: './index.html', to: 'index.html' },
        { from: './css', to: 'css' },
        { from: './scripts/locale', to: 'scripts/locale' },
        {
          from: './apps', to: 'apps', filter: (rp) => {
            return !/\.ts$/.test(rp);
          },
        },
      ],
    }),
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ]
  }
};