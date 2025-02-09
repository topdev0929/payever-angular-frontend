const path = require('path');
const fs = require('fs');

const stageUrl = readFileSyncSafe(path.join(__dirname, '.pe.domain'), 'https://transactions-backend.test.devpayever.com/');

const host = readFileSyncSafe(path.join(__dirname, '.pe.localhost'), 'localhost');
const port = '8080';
const hostUrl = `http://${host}:${port}/`;

module.exports = [{
  context: [
    // don't remember to set base url '/' in environment to proxy these requests
    '/api/rest/v1/checkout',
  ],
  target: 'https://checkout-php.test.devpayever.com/',
  logLevel: 'debug',
  changeOrigin: true,
  proxyTimeout: 360000,
  onProxyRes (proxyRes, req, res) {
    handleProxyRes(proxyRes);
  }
}, {
  context: [
    '/api/business/**'
  ],
  target: 'https://transactions-backend.test.devpayever.com/',
  logLevel: 'debug',
  changeOrigin: true,
  proxyTimeout: 360000,
  onProxyRes (proxyRes, req, res) {
    handleProxyRes(proxyRes);
  }
}];

function handleProxyRes(proxyRes) {
  delete proxyRes.headers['content-security-policy'];

  // Using this manual replacing because localhost and staging showrooms
  // has different protocols - HTTP vs. HTTPS, and `autoRewrite: true`
  // option is not working (also with `secure: true`, or, instead,
  // `hostRewrite: true`).
  if (proxyRes.headers.location) {
    proxyRes.headers.location = proxyRes.headers.location.replace(testUrl, hostUrl);
  }

  proxyRes.headers['access-control-allow-origin'] = hostUrl;
  proxyRes.headers['access-control-allow-credentials'] = 'true';

  // Removing `secure` option of Set-Cookie header to allow browser
  // apply cookies from servers under HTTPS.
  if (proxyRes.headers['set-cookie']) {
    proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => cookie.replace(/; secure/, ''));
  }
}

function readFileSyncSafe (path, defaultValue) {
  try {
    return fs.readFileSync(path, 'utf-8').trim() || defaultValue;
  } catch (err) {
    console.error(`File ${path} is not available by [${err.code}] error, using "${defaultValue}" instead`);
    return defaultValue;
  }
}
