import { PebAppType, PebVersion } from '@pe/builder-core';
import { ConsumerApi } from '../../api';
import { BuilderMessageInterface, DomainInterface, PrerenderRequiredDataInterface, ShopInterface } from '../../interfaces';
import { getPagesFromTheme } from './pages-helper';

export async function handleBuilderEvent(data: BuilderMessageInterface, ackCallback: () => void, isDev: boolean = false): Promise<PrerenderRequiredDataInterface> {
  const prerenderRequiredData: PrerenderRequiredDataInterface = {
    appType: PebAppType.shop,
    domainNames: [],
    routes: []
  };

  const allowedApps: PebAppType[] = [ PebAppType.pos, PebAppType.shop ];

  const businessId: string = data.payload.businessId;
  const appId: string = data.payload.applicationId;

  const api: ConsumerApi = new ConsumerApi(isDev);

  if ( !data.payload ) {
    ackCallback();
    return;
  }

  if (allowedApps.indexOf(data.payload.applicationType as any) === -1) {
    ackCallback();
    return;
  }

  const appType: PebAppType = data.payload.applicationType === 'shop'
    ? PebAppType.shop
    : PebAppType.pos;

  const publishedVersion: PebVersion = await api.getPublishedVersion(appId);
  if (!publishedVersion) {
    console.log(`Published version is missed for app with id ${appId}`);
    ackCallback();
    return;
  }

  const routes: string[] = getPagesFromTheme(publishedVersion);

  prerenderRequiredData.appType = appType;
  prerenderRequiredData.routes = routes;

  const getShop$: Promise<ShopInterface> = appType === PebAppType.shop
    ? api.getShopById(businessId, appId)
    : Promise.resolve(null);
  const getDomains$: Promise<DomainInterface[]> = api.getDomainsByAppId(businessId, appId);

  await Promise.all([ getShop$, getDomains$ ]).then((data: [ShopInterface, DomainInterface[]]) => {
    const shop: ShopInterface = data[0];
    const domains: DomainInterface[] = data[1] || [];

    if ( !shop ) {
      console.log(`Shop with id ${appId} not exist or is not live`);
      return;
    }

    if ( !domains ) {
      console.log(`Domain missed for app with id ${appId}`);
      return;
    }

    prerenderRequiredData.domainNames = domains.map(d => d.name);

    if (appType === PebAppType.shop && !(shop.live && domains.length)) {
      return;
    }
  });

  ackCallback();

  return prerenderRequiredData;
}
