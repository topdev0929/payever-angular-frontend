const PROXY_CONFIG = [
  {
    context: [
      '/api',
      '/products/api',
      '/stores/api',
      '/media/api',
      '/auth/api'
    ],
    target: 'https://stage.payever.de/',
    secure: false,
    logLevel: 'debug',
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;

