import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { PebAppType } from '@pe/builder-core';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

export enum NotFound {
  Page = 'page',
  Shop = 'shop',
}

@Injectable()
export class ClientLauncherService {
  dataLoaded: boolean = false;
  notFound: NotFound = null;
  notAvailable: boolean = false;
  app: PebAppType;

  constructor(private configService: EnvironmentConfigService,
              @Inject(DOCUMENT) private document: Document) {
  }

  get isOpenedOnBuilderClientDomain(): boolean {
    const builderClientUrl: string = this.configService.getFrontendConfig().builderClient;
    return builderClientUrl && (this.document.location.origin === builderClientUrl);
  }

  get currentApp(): PebAppType {
    let app: PebAppType = null;

    if (this.app) {
      return this.app;
    } else if (this.isOpenedOnBuilderClientDomain) {
      const standaloneAppName: string = this.getStandaloneAppName();

      if (standaloneAppName === 'shop') {
        app = PebAppType.shop;
      } else if (standaloneAppName === 'email') {
        app = PebAppType.marketing;
      } else if (standaloneAppName === 'business' || standaloneAppName === 'pos') {
        app = PebAppType.pos;
      } else {
        console.warn('Unknown standalone app name', standaloneAppName);
      }
      return app;
    } else {
      const payeverHosts: string[] = [
        this.configService.getPrimaryConfig().businessHost,
        this.configService.getPrimaryConfig().shopHost,
        this.configService.getPrimaryConfig().emailHost,
      ];

      const isPayeverHost: boolean = payeverHosts.some(peHost =>
        this.document.location.hostname.endsWith(peHost)
      );

      if (isPayeverHost) {
        const lastHostnameSegment: string = this.getLastHostSegment();

        if (lastHostnameSegment === 'shop') {
          app = PebAppType.shop;
        } else if (lastHostnameSegment === 'email') {
          app = PebAppType.marketing;
        } else if (lastHostnameSegment === 'business' || lastHostnameSegment === 'pos') {
          app = PebAppType.pos;
        } else {
          console.warn('Unknown last host segment', lastHostnameSegment);
        }
      } else {
        app = PebAppType.shop; // NOTE: only shop can be opened on non-payever domain
      }

      return app;
    }
  }

  setFavicon(): void {
    const link: HTMLLinkElement = this.document.querySelector("link[rel*='icon']") || this.document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    let icon: string;
    if (this.currentApp === PebAppType.shop) {
      icon = '/assets/ui-kit/icons-png/icon-commerceos-store-32.png';
    } else if (this.currentApp === PebAppType.pos) {
      icon = '/assets/ui-kit/icons-png/icon-commerceos-pos-32.png';
    } else if (this.currentApp === PebAppType.marketing) {
      icon = '/assets/ui-kit/icons-png/icon-commerceos-marketing-32.png';
    }
    link.href = this.document.location.origin + icon;
    this.document.getElementsByTagName('head')[0].appendChild(link);
  }

  private getLastHostSegment(): string {
    const url = this.document.location.hostname;

    const segments: string[] = url.replace(/\//g, '').split('.');
    return segments[segments.length - 1];
  }

  private getStandaloneAppName(): string {
    const pathSegments = this.document.location.pathname.split('/');

    if (!pathSegments || !pathSegments.length) {
      return null;
    }

    if (this.isOpenedOnBuilderClientDomain) {
      return pathSegments.length > 1 ? pathSegments[1] : null;
    }
  }
}
