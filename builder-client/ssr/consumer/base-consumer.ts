import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AzureHelper } from '../azure-helper';
import { DeviceType, PrerenderRequiredDataInterface, RouteHtmlInterface } from '../interfaces';
import { UniversalPrerenderer } from '../prerender';
import { handleBuilderEvent } from './rmq-events-handlers/builder-events-handler';
import { handleDomainEvent } from './rmq-events-handlers/domain-events-handler';
import { BUILDER_ROUTING_KEYS, DOMAIN_ROUTING_KEYS, SHOP_ROUTING_KEYS } from './routing-keys';
import { handleShopEvent } from './rmq-events-handlers/shop-events-handler';

export async function baseConsumer(
  routingKey: string,
  data: any,
  ackCallback: () => void,
  isDev: boolean
): Promise<void> {
  if (!routingKey) {
    console.log('Routing key is empty');
    ackCallback();
  }

  const isMessageFromBuilder: boolean = BUILDER_ROUTING_KEYS.indexOf(routingKey) >= 0;
  const isMessagefromShop: boolean = SHOP_ROUTING_KEYS.indexOf(routingKey) >= 0;
  const isMessageFromDomain: boolean = DOMAIN_ROUTING_KEYS.indexOf(routingKey) >= 0;

  let prerenderRequiredData: PrerenderRequiredDataInterface;

  if (isMessageFromBuilder) {
    prerenderRequiredData = await handleBuilderEvent(data, ackCallback, isDev);
  } else if (isMessagefromShop) {
    prerenderRequiredData = await handleShopEvent(data, ackCallback, isDev);
  } else if (isMessageFromDomain) {
    prerenderRequiredData = await handleDomainEvent(data, routingKey, ackCallback, isDev);
  }

  if (prerenderRequiredData
    && prerenderRequiredData.routes
    && prerenderRequiredData.domainNames
    && prerenderRequiredData.appType
  ) {
    const { routes, domainNames, appType } = prerenderRequiredData;
    const prerenderer: UniversalPrerenderer = new UniversalPrerenderer();

    // NOTE: does not make sense which domain is here: own or payever domain because builder-client
    // uses it only to get app type, app id, business id, but not name
    const domainName: string = domainNames[0];

    ['desktop', 'tablet', 'mobile'].forEach((deviceType: DeviceType) => {
      prerenderer.prerender(domainName, routes, deviceType).subscribe((routeHtml: RouteHtmlInterface) => {
        if (isDev) {
          const BROWSER_FOLDER = join(process.cwd(), 'dist', 'server');
          const splittedRoute: string[] = routeHtml.route.split('/');
          const fullPath = join(BROWSER_FOLDER, domainName, ...splittedRoute);
          if (!existsSync(fullPath)) {
            mkdirSync(fullPath, { recursive: true });
          }
          writeFileSync(join(fullPath, `index.${deviceType}.html`), routeHtml.html);
        }

        const azureHelper: AzureHelper = new AzureHelper();
        for (const domain of domainNames) {
          azureHelper.uploadFile(routeHtml.html, appType, domain, routeHtml.route, `index.${deviceType}.html`);
        }
      });
    })
  }
}
