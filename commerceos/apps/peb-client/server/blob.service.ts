import https from 'https';

import { BlobServiceClient, ContainerClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import axios from 'axios';
import md5 from 'md5';


const containerClient = getContainerClient();
const api = axios.create({ httpsAgent: new https.Agent({ keepAlive: true }) });

export async function hasValidCache(requestKey: string): Promise<boolean> {
  const hash = md5(requestKey);
  const url = `${process.env.APP_API}/api/integration/cache`;

  const statusResp = await api.post(url, { hash });
  const status = statusResp.status;

  return status === 200;
}

export async function getCachedData(requestKey: string): Promise<NodeJS.ReadableStream | undefined> {
  const hash = md5(requestKey);
  const blobClient = containerClient.getBlobClient(hash);
  const exists = await blobClient.exists();
  if (!exists) {
    return undefined;
  }

  const response = await blobClient.download();

  return response.readableStreamBody;
}

export async function uploadCacheData(requestKey: string, data: Buffer) {
  const hash = md5(requestKey);
  const blockBlobClient = containerClient.getBlockBlobClient(hash);
  await blockBlobClient.uploadData(data);
}

function getContainerClient(): ContainerClient {
  const account = process.env.STORAGE_ACCOUNT_NAME ?? '';
  const accountKey = process.env.STORAGE_KEY ?? '';

  const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
  const blobServiceClient = new BlobServiceClient(process.env.STORAGE_URL ?? '', sharedKeyCredential);

  return blobServiceClient.getContainerClient(process.env.STORAGE_CONTAINER ?? '');
}
