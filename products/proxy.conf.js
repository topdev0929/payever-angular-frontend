const PROXY_CONFIG = [
  {
    context: [
      '/auth'
    ],
    pathRewrite: {
      "^/auth": ""
    },
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true
  },
  {
    context: [
      '/user'
    ],
    pathRewrite: {
      "^/user": ""
    },
    target: 'http://localhost:3001',
    secure: false,
    changeOrigin: true
  },
  {
    context: [
      '/api',
      '/media/api',
      '/notifications/api',
      '/products/api'
    ],
    target: 'https://stage.payever.de/',
    secure: false,
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;
