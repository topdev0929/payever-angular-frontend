import { Configuration, IgnorePlugin, ProvidePlugin } from 'webpack';

const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');


export default {
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
    },
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new RetryChunkLoadPlugin({
      cacheBust: `function() {
        return Date.now();
      }`,
      retryDelay: 3000,
      maxRetries: 5,
      lastResortScript: 'window.location.reload();',
    }),
  ],
} as Configuration;
