import { PebAppType, PebVersion } from '@pe/builder-core';
import { AzureHelper } from './azure-helper';
import { AZURE_BLOB_NAME } from './const';
import { AzureAppFolderEnum, DeviceType, DomainInterface, ShopInterface } from './interfaces';

const request = require('request-promise-native');

export class ConsumerApi {

  constructor(private isDev: boolean = false) {}

  getDomainsByAppId(businessId: string, shopId: string): Promise<DomainInterface[]> {
    const path: string = `${process.env.MICRO_URL_BUILDER}/api/business/${businessId}/app/${shopId}/domain?all=true`;

    if (this.isDev) {
      console.log(`Request: get domain by app id, path = ${path}`);
    }

    return request(path, { json: true }).then((domains: DomainInterface[]) => {
      if (this.isDev) {
        console.log(`Request: get domain by app id, response:`, domains)
      }

      return domains;
    });
  }

  getPublishedVersion(appId: string): Promise<PebVersion> {
    const path: string = `${process.env.MICRO_URL_BUILDER}/api/versions/published-version/${appId}`;

    if (this.isDev) {
      console.log(`Request: get published version by app id without page content: path = ${path}`);
    }

    return request(path, { json: true });
  }

  getShopById(businessId: string, shopId: string): Promise<ShopInterface> {
    const path: string = `${process.env.MICRO_URL_SHOPS}/api/business/${businessId}/shop/${shopId}`;

    if (this.isDev) {
      console.log(`Request: get shop by id: path = ${path}`);
    }

    return request(path, { json: true }).then(response => {
      if (this.isDev) {
        console.log(`Request: get shop by id, response:`, response);
      }

      return response;
    });
  }

  getHtmlFromBlob(domainName: string, appType: PebAppType, deviceType: DeviceType, route: string): Promise<string> {
    // remove first "/"
    if (route.startsWith('/')) {
      route = route.substring(1);
    }

    // add last "/" for non empty string
    if ( !route.endsWith('/') && route.length > 0) {
      route = `${route}/`;
    }

    const appFolder: AzureAppFolderEnum = AzureHelper.getBlobFolderByApp(appType);

    const path: string = `${process.env.MICRO_URL_CUSTOM_STORAGE}/${AZURE_BLOB_NAME}/${appFolder}/${domainName}/${route}index.${deviceType}.html`;
    console.log('ROUTEPATH', path);

    return request(path);
  }
}
