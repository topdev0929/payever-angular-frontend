import { PebAppType, PebVersion } from '@pe/builder-core';
import { ConsumerApi } from '../../api';
import { DomainInterface, PrerenderRequiredDataInterface, ShopMessageInterface } from '../../interfaces';
import { getPagesFromTheme } from './pages-helper';

export async function handleShopEvent(
  data: ShopMessageInterface,
  ackCallback: () => void,
  isDev: boolean = false
): Promise<PrerenderRequiredDataInterface> {
  const prerenderRequiredData: PrerenderRequiredDataInterface = {
    appType: PebAppType.shop,
    domainNames: null,
    routes: [],
  };

  if (!data.payload || !data.payload.shopId || !data.payload.businessId) {
    console.error(`Event ${data.name}. Wrong message`, data);
    ackCallback();
    return;
  }

  const shopId: string = data.payload.shopId;

  const api: ConsumerApi = new ConsumerApi(isDev);
  const domains: DomainInterface[] = await api.getDomainsByAppId(data.payload.businessId, shopId);

  if (!domains) {
    console.log(`Domain missed for shop with id ${shopId}`);
    ackCallback();
    return;
  }

  prerenderRequiredData.domainNames = domains.map(d => d.name);

  const publishedVersion: PebVersion = await api.getPublishedVersion(shopId);
  if (!publishedVersion) {
    console.log(`Published version is missed for app with id ${shopId}`);
    ackCallback();
    return;
  }

  const routes: string[] = getPagesFromTheme(publishedVersion);
  prerenderRequiredData.routes = routes;

  ackCallback();
  return prerenderRequiredData;
}
