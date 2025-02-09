webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');


module.exports = {
  output: {
    hashFunction: 'sha256' // ERR_OSSL_EVP_UNSUPPORTED
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
};
