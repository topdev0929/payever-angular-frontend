/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import { exit } from 'process';

import { Client } from '@elastic/elasticsearch';
import axios from 'axios';
import FormData = require('form-data');

import { environment as env } from '../../apps/environments/environment';


const CONCURRENT_REQUESTS = 10;


const APM_SERVER_API_KEY = process.env.APM_SERVER_API_KEY;
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;

if (!APM_SERVER_API_KEY) {
  console.error('please provide "APM_SERVER_API_KEY" env variable');
  exit(1);
}

if (!ELASTICSEARCH_API_KEY) {
  console.error('please provide "ELASTICSEARCH_API_KEY" env variable');
  exit(1);
}

async function* walk(dir: string, filter?: (path: string) => boolean): AsyncGenerator<string> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) {
      yield* walk(entry, filter);
    }
    else if (d.isFile() && (!filter || filter(entry))) {
      yield entry;
    }
  }
}

async function* walkInBatch(batchSize: number, ...args: Parameters<typeof walk>) {
  let files: string[] = [];
  for await (const p of walk(...args)) {
    files = files.concat(p);
    if (files.length >= batchSize) {
      yield files;
      files = [];
    }
  }
  if (files.length > 0) {
    yield files;
  }
}

function resolveDist() {
  const dist = path.resolve('./dist');

  return fs.existsSync(dist)
    ? dist
    : path.resolve('.');
}

export async function UploadSourceMapFiles(checkoutVersion: string) {
  const dist = resolveDist();
  if (!checkoutVersion) {
    console.error(`checkoutVersion: ${checkoutVersion} is not valid`);

    return;
  }
  for await (const files of walkInBatch(CONCURRENT_REQUESTS, dist, p => p.endsWith('.map'))) {

    const batch = files.map(async (p) => {
      const data = new FormData();
      data.append('service_name', 'checkout-app');
      data.append('service_version', checkoutVersion);

      const bundle_name = p.slice(0, -4) // strip ".map"
        .replace(dist, '');
      const bundle_filepath = bundle_name.replace(/^\/(\D{2})\/(.+)/,
        (_, locale, rest) => `${env.apis.frontend.checkoutWrapper}/wrapper/${locale}/${checkoutVersion}/${rest}`);
      data.append('bundle_filepath', bundle_filepath);
      data.append('sourcemap', fs.createReadStream(p));
      try {
        console.log(`trying to upload ${p.replace(dist, '')} bundle_filepath: ${bundle_filepath}`);

        await axios.post(`${env.apis.custom.apmServer}/assets/v1/sourcemaps`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `ApiKey ${APM_SERVER_API_KEY}`,
          },
        });
      } catch ({ response }) {
        console.error(`Error posting ${files}`, response.data);
      }
    });

    await Promise.allSettled(batch);
  }
}

export async function ClearIndexes() {
  const client = new Client({
    node: env.apis.custom.elasticsearchUrl,
    auth: {
      apiKey: ELASTICSEARCH_API_KEY,
    },
  });

  await client.deleteByQuery({
    index: 'apm*-sourcemap',
    query: {
      term: { 'sourcemap.service.name': 'checkout-app' },
    },
  });
}
