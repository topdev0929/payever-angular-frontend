const PROXY_CONFIG = [
  {
    context: [
      '/finances/api/rest/v1',
      '/media'
    ],
    target: "https://stage.payever.de",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
