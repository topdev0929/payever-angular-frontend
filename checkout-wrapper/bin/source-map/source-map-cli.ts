/* eslint-disable no-console */
import { ClearIndexes, UploadSourceMapFiles } from './source-map-tools';

const action = process.argv.slice(-1)[0];

main().catch((err) => {
  console.error(err);
});

async function main() {
  switch (action) {
    case 'push': {
      await push();
      break;
    }
    case 'purge': {
      await purge();
      break;
    }
    case 'sync': {
      await purge();
      await push();

      break;
    }
    default: {
      console.log(`no such action: ${action}`);
    }
  }
}

function push() {
  const MICRO_CHECKOUT_VERSION = process.env.MICRO_CHECKOUT_VERSION;

  if (MICRO_CHECKOUT_VERSION) {
    return UploadSourceMapFiles(MICRO_CHECKOUT_VERSION).catch((err) => {
      console.error(err);

    });
  } else {
    console.error('please provide the "MICRO_CHECKOUT_VERSION" env variable');
  }
}

function purge() {
  return ClearIndexes()
    .then(() => {
      console.log('all checkout-app indexes cleared');
    }).catch((err) => {
      console.error(err);
    });
}