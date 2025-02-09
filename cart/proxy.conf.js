const PROXY_CONFIG = [
  {
    context: [
      '/products'
    ],
    pathRewrite: {
      "": ""
    },
    target: 'https://products-backend.test.devpayever.com',
    secure: false,
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;
