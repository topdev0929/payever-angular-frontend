import {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  Pipeline,
  ServiceURL,
  SharedKeyCredential,
  StorageURL
} from '@azure/storage-blob';
import { BlobItem, ContainerListBlobFlatSegmentResponse } from '@azure/storage-blob/typings/lib/generated/lib/models';
import { PebAppType } from '@pe/builder-core';

import { AZURE_BLOB_NAME } from './const';
import { AzureAppFolderEnum } from './interfaces';

export class AzureHelper {

  account: string = process.env.STORAGE_ACCOUNT_NAME;
  password: string = process.env.STORAGE_KEY;

  private pipeline: Pipeline;
  private serviceURL: ServiceURL;
  private containerURL: ContainerURL;

  constructor() {
    const sharedKeyCredential: SharedKeyCredential = new SharedKeyCredential(
      this.account,
      this.password
    );

    this.pipeline = StorageURL.newPipeline(sharedKeyCredential);
    this.serviceURL = new ServiceURL(
      process.env.MICRO_URL_CUSTOM_STORAGE, // `https://${this.account}.blob.core.windows.net`,
      this.pipeline
    );
    this.containerURL = ContainerURL.fromServiceURL(this.serviceURL, AZURE_BLOB_NAME);
  }

  async uploadFile(content: string, appType: PebAppType, domainName: string, route: string, fileName: string): Promise<any> {
    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);

    const path: string = `${appFolder}/${domainName}/${route !== '' ? route + '/' : ''}${fileName}`;

    const blobURL = BlobURL.fromContainerURL(this.containerURL, path);
    const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);
    const uploadBlobResponse = await blockBlobURL.upload(
      Aborter.none,
      content,
      content.length
    );
    console.log(
      `Upload block blob ${fileName} successfully`,
      uploadBlobResponse.requestId
    );
  }

  /**
   * Azure SDK do not allow just copy folder with blobs. We have to copy every blob inside folder to the new url.
   * @param appType
   * @param oldDomainName
   * @param newDomainName
   */
  async copyFolder(appType: PebAppType, oldDomainName: string, newDomainName: string): Promise<any> {
    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);

    const blobsForOldDomain: BlobItem[] = await this.getBlobsForDomain(Aborter.none, this.containerURL, appFolder, oldDomainName);

    const copyPromiseArray: Promise<void>[] = [];
    for (const blob of blobsForOldDomain) {
      const oldBlobURL: BlobURL = BlobURL.fromContainerURL(this.containerURL, blob.name); // should be absolute path

      const newPath: string = blob.name.replace(`/${oldDomainName}/`, `/${newDomainName}/`);
      const newBlobURL: BlobURL = BlobURL.fromContainerURL(this.containerURL, newPath);

      const copyPromise: Promise<void> = newBlobURL.startCopyFromURL(Aborter.none, oldBlobURL.url).then(() => {
        console.log(`${blob.name} copied to ${newPath}`);
      });

      copyPromiseArray.push(copyPromise);
    }

    return Promise.all(copyPromiseArray);
  }

  /**
   * We have to remove every blob inside folder to remove folder itself
   * @param appType
   * @param domainName
   */
  async removeAllBlobsForDomain(appType: PebAppType, domainName: string): Promise<any> {
    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);
    const blobsForOldDomain: BlobItem[] = await this.getBlobsForDomain(Aborter.none, this.containerURL, appFolder, domainName);

    const deletePromiseArray: Promise<void>[] = [];
    for (const blob of blobsForOldDomain) {
      const oldBlobURL: BlobURL = BlobURL.fromContainerURL(this.containerURL, blob.name); // should be absolute path
      const deletePromise: Promise<void> = oldBlobURL.delete(Aborter.none).then(() => {
        console.log(`Blob removed with url ${blob.name}`);
      });
      deletePromiseArray.push(deletePromise);
    }

    return Promise.all(deletePromiseArray);
  }

  static getBlobFolderByApp(app: PebAppType): AzureAppFolderEnum {
    let folder: AzureAppFolderEnum;
    switch (app) {
      case PebAppType.shop:
        folder = AzureAppFolderEnum.Shop;
        break;
      case PebAppType.pos:
        folder = AzureAppFolderEnum.Pos;
        break;
      default:
        break;
    }
    return folder;
  }

  /**
   * Returns all files inside folder with name == domain name
   * @param aborter
   * @param containerURL
   * @param appType
   * @param domainName
   */
  async getBlobsForDomain(aborter, containerURL: ContainerURL, appType: AzureAppFolderEnum, domainName: string): Promise<BlobItem[]> {
    let response: ContainerListBlobFlatSegmentResponse;
    let marker: string;
    const blobs: BlobItem[] = [];

    do {
      response = await containerURL.listBlobFlatSegment(aborter);
      marker = response.marker;
      blobs.push(...response.segment.blobItems);
    } while (marker);

    const startWith: string = `${appType}/${domainName}/`;
    const blobsForDomain: BlobItem[] = blobs.filter((blob: BlobItem) => blob.name.startsWith(startWith));
    return blobsForDomain;
  }
}
