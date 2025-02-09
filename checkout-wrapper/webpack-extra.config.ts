import { ProvidePlugin, IgnorePlugin } from 'webpack';
import { RetryChunkLoadPlugin } from 'webpack-retry-chunk-load-plugin';

export default {
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
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
};
