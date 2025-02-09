import { PebAppType, PebVersion } from '@pe/builder-core';
import { ConsumerApi } from '../../api';
import { AzureHelper } from '../../azure-helper';
import {
  DomainCreatedMessageInterface,
  DomainInterface,
  DomainMessage,
  DomainRemovedMessageInterface,
  DomainUpdatedMessageInterface,
  PrerenderRequiredDataInterface,
} from '../../interfaces';
import { getPagesFromTheme } from './pages-helper';
import { DOMAIN_CREATED_EVENT_NAME, DOMAIN_REMOVED_EVENT_NAME, DOMAIN_UPDATED_EVENT_NAME } from '../routing-keys';

export async function handleDomainEvent(
  data: DomainMessage,
  routingKey: string,
  ackCallback: () => void,
  isDev: boolean = false
): Promise<PrerenderRequiredDataInterface> {
  let prerenderRequiredData: PrerenderRequiredDataInterface = {
    appType: PebAppType.shop,
    domainNames: null,
    routes: []
  };

  switch(routingKey) {
    case DOMAIN_CREATED_EVENT_NAME:
      prerenderRequiredData = await domainCreated(data as DomainCreatedMessageInterface, routingKey, ackCallback);
      break;
    case DOMAIN_REMOVED_EVENT_NAME:
      await domainDeleted(data as DomainRemovedMessageInterface);
      break;
    case DOMAIN_UPDATED_EVENT_NAME:
      await domainUpdated(data as DomainUpdatedMessageInterface, ackCallback);
      break;
    default:
      break;
  }

  return prerenderRequiredData;
}

async function domainCreated(
  data: DomainCreatedMessageInterface,
  routingKey: string,
  ackCallback: () => void,
): Promise<PrerenderRequiredDataInterface> {
  const prerenderRequiredData: PrerenderRequiredDataInterface = {
    appType: PebAppType.shop,
    domainNames: [],
    routes: []
  };

  if (!data) {
    console.log(`Event ${routingKey}. Content is missed`);
    ackCallback();
    return;
  }

  if (!data.payload) {
    console.log(`Event ${routingKey}. Data is wrong (domain instance not passed in payload)`, data.payload);
    ackCallback();
    return;
  }

  const api: ConsumerApi = new ConsumerApi();

  const newDomain: DomainInterface = data.payload;

  // NOTE: existingDomains already contains new domain
  const existingDomains: DomainInterface[] = await api.getDomainsByAppId(newDomain.business, newDomain.app);
  prerenderRequiredData.domainNames = existingDomains.map(d => d.name);

  if (newDomain.type === 'pos') {
    console.log(`Event ${routingKey}. Domain type is POS. Stop  to handle it.`, data.payload);
    ackCallback();
    return;
  }

  // const shop: ShopInterface = await api.getShopById(newDomain.business, newDomain.app);
  // if (!shop.live) {
  //   console.log(`Event ${routingKey}. Shop with id ${shop._id} is not "Live"`);
  //   ackCallback();
  //   return;
  // }

  const publishedVersion: PebVersion = await api.getPublishedVersion(newDomain.app);
  if (!publishedVersion) {
    console.log(`Published version is missed for app with id ${newDomain.app}`);
    ackCallback();
    return;
  }

  const routes: string[] = getPagesFromTheme(publishedVersion);
  prerenderRequiredData.routes = routes;

  ackCallback();
  return prerenderRequiredData;
}

async function domainDeleted(data: DomainRemovedMessageInterface): Promise<void> {
  const domain: DomainInterface = data.payload;

  const azureHelper: AzureHelper = new AzureHelper();
  return azureHelper.removeAllBlobsForDomain(domain.type, domain.name);
}

async function domainUpdated(data: DomainUpdatedMessageInterface, ackCallback: () => void,): Promise<void> {
  const azureHelper: AzureHelper = new AzureHelper();
  try {
    await azureHelper.copyFolder(data.payload.type as PebAppType, data.payload.oldDomainName, data.payload.newDomainName);
    await azureHelper.removeAllBlobsForDomain(data.payload.type as PebAppType, data.payload.oldDomainName);
  } catch (error) {
    console.log(error);
  } finally {
    ackCallback();
  }
}
