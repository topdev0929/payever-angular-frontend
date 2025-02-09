import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ApplicationRef, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Resolve, Router, ActivatedRoute } from '@angular/router';
import { PebAppType } from '@pe/builder-core';

import { EnvironmentConfigService, PrimaryConfigInterface } from '@pe/ng-kit/modules/environment-config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomainInterface, DomainStatusEnum } from '../../../../ssr/interfaces';
import { ApiService as ClientApiService, ClientLauncherService, NotFound } from '../../../app/services';

import { EnvService } from '../services';

@Injectable()
export class ClientStateResolver implements Resolve<DomainInterface> {

  constructor(
    private applicationRef: ApplicationRef,
    private envConfigService: EnvironmentConfigService,
    private envService: EnvService,
    private apiService: ClientApiService,
    private launcherService: ClientLauncherService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: string,
    @Inject(DOCUMENT) private document: Document,
    @Inject('CLIENT_DOMAIN') private injectedDomain: string
  ) {
  }

  resolve(): Observable<DomainInterface> {
    if (this.launcherService.dataLoaded) {
      return;
    }
    this.launcherService.setFavicon();

    const domainName: string = this.injectedDomain
      || this.envService.domain
      || this.getDomainNameFromRootDataset()
      || this.getDomainFromUrl();

    if (!domainName) {
      return null;
    }

    this.envService.domain = domainName;

    return (
      this.apiService.getDomain(domainName)
    )
      .pipe(map((domainData: DomainInterface) => {
        switch (domainData.status) {
          // load background image when store is under password
          case DomainStatusEnum.Passworded:
            if (this.envService.defaultStoreLoading) {
              this.envService.loadBackgroundImage = true;
              this.router.navigate(['/']).then().catch();
            }
            else {
              this.envService.loadingPasswordedStore = true;
            }
            break;
          // unknown error loading info
          case DomainStatusEnum.Unknown:
            this.launcherService.notFound = NotFound.Shop;
            if (this.launcherService.currentApp === PebAppType.shop) {
              this.router.navigate(['404'], { skipLocationChange: true }).then().catch();
            }

            return null;
          case DomainStatusEnum.Unregistered:
            this.envService.domain = this.envService.defaultDomain;
            this.envService.defaultStoreLoading = true;
            this.router.navigate(['no-domain']).then().catch();

            return null;
          default:
            break;
        }

        this.envService.business = domainData.business;
        this.envService.theme = domainData.theme;
        this.envService.appId = domainData.app;
        this.envService.app = domainData.type;

        this.launcherService.dataLoaded = true;

        return domainData;
      }));
  }

  getDomainFromUrl(): string {
    const pathSegments = this.document.location.pathname.split('/');

    let domain: string;

    // NOTE if builder client opened on url like builder-client.payever.org/pos/uuid, then 'uuid' - is domain name
    if (this.launcherService.isOpenedOnBuilderClientDomain) {
      domain = pathSegments.length > 2 ? pathSegments[2] : null;
    } else {
      // NOTE: client opened on payever urls like: uuid.payever.business, domain.payever.shop, uuid.payever.email
      if (this.isClientOpenedOnPayeverDomain()) {
        switch (this.launcherService.currentApp) {
          case PebAppType.marketing:
            domain = pathSegments.length > 2 ? pathSegments[2] : null;
            break;
          case PebAppType.shop:
          case PebAppType.pos:
            domain = this.document.location.hostname.split('.')[0];
            break;
          default:
            domain = pathSegments.length > 1 ? pathSegments[1] : null;
            break;
        }
      } else {
        // NOTE: shop opened on own domain like domain.com
        domain = this.document.location.hostname;
      }
    }

    return domain;
  }

  /**
   * This code needed for localhost, because it can be executed before root component created
   */
  private getDomainNameFromRootDataset(): string {
    let domainName: string;
    if (isPlatformBrowser(this.platformId)) {
      domainName = (this.document.getElementsByTagName('app-builder-client').item(0) as HTMLElement)
        .dataset['domain'];
    }
    return domainName;
  }

  /**
   * check if client opened on domains like
   * - uuid.payever.business
   * - domain.payever.shop
   * - uuid.payever.email
   */
  private isClientOpenedOnPayeverDomain(): boolean {
    const config: PrimaryConfigInterface = this.envConfigService.getPrimaryConfig();
    const locations: string[] = [
      config.emailHost,
      config.businessHost,
      config.shopHost,
      'localhost.shop', // for local testing
      'localhost.business', // for local testing
    ];

    return locations.findIndex((host: string) => {
      return this.document.location.hostname.indexOf(host) >= 0;
    }) >= 0;
  }
}
