import { Injectable, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AbstractService, PlatformService } from '@pe/ng-kit/modules/common';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import {
  PlatformHeaderService,
  PlatfromHeaderControlInterface,
  PlatfromHeaderInterface,
  PlatfromHeaderLinkControlInterface
} from '@pe/ng-kit/modules/platform-header';
import { NavbarControlType } from '@pe/ng-kit/src/kit/navbar';
import { ApiService } from './api.service';
import { filter, take, tap } from 'rxjs/operators';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

const APP_DETAILS_TEXT: string = 'Transactions'; // TODO Translate
const APP_DETAILS_ICON: string = 'icon-apps-orders';
const MICRO_CODE: string = 'transactions';

@Injectable()
export class HeaderService extends AbstractService {

  constructor(
    private platformHeaderService: PePlatformHeaderService,
    private platformService: PlatformService,
    private apiService: ApiService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    super();

    // handles navigation from Notification item in order to open particular transaction
    this.platformService.microNavigation$.pipe(
      filter((data: string | any) => !!data.fromNotification),
      tap((microPath: string | any) => {
        const urlSegments: string[] = this.router.url.split('/').filter((s: string) => s !== '');
        const targetSegments: string[] = microPath.url.split('/').filter((s: string) => s !== '');
        this.router.navigate([urlSegments[0], urlSegments[1], ...targetSegments]);
      })
    ).subscribe();
  }

  setMainHeader(showAll: boolean, id: string, isPersonal: boolean): void {
    // const controls: PlatfromHeaderControlInterface[] = !showAll ? [] : [{
    //   type: NavbarControlType.Link,
    //   title: this.translateService.translate('header.all'),
    //   initiallySelected: true
    // } as PlatfromHeaderLinkControlInterface];
    // const platformHeader: PlatfromHeaderInterface = {
    //   microCode: MICRO_CODE,
    //   appDetails: {
    //     text: this.translateService.translate(APP_DETAILS_TEXT),
    //     icon: APP_DETAILS_ICON
    //   },
    //   closeConfig: {
    //     showClose: true
    //   },
    //   controls
    // };
    // this.platformHeaderService.setPlatformHeader(platformHeader);

    const config: PePlatformHeaderConfig = {
      mainDashboardUrl: isPersonal ? '/personal/' : `/business/${id}/`,
      currentMicroBaseUrl: `/${ isPersonal ? 'personal' : 'business' }/${id}/transactions`,
      isShowShortHeader: false,
      mainItem: {
        title: 'Transactions',
        icon: '#icon-apps-orders',
        iconSize: '18px',
        iconType: 'vector',
      },
      isShowMainItem: true,
      closeItem: {
        title: this.translateService.translate('header.back_to_apps'),
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        showIconBefore: true,
        onClick: () => {
          window.location.href = isPersonal ? './personal/' : `./business/${id}/`;
        },
      },
      isShowCloseItem: true,
      isShowBusinessItem: false,
    };
    setTimeout(() => {
      this.platformHeaderService.setConfig(config);
    });
  }

  setShortHeader(titleKey: string, onCancel: () => void): void {
    // const platformHeader: PlatfromHeaderInterface = {
    //   microCode: MICRO_CODE,
    //   appDetails: null,
    //   hideProfileMenu: true,
    //   disableSubheader: true,
    //   closeConfig: {
    //     showClose: true,
    //     callbackId: this.platformHeaderService.registerCallback(() => {
    //       onCancel();
    //     }, 'transactionsShortHeader')
    //   },
    //   controls: [{
    //     type: NavbarControlType.Text,
    //     classes: 'text-visited',
    //     title: this.translateService.translate(titleKey)
    //   } as PlatfromHeaderLinkControlInterface]
    // };
    // this.platformHeaderService.setPlatformHeader(platformHeader);
    // this.platformService.microAppReady = MICRO_CODE;
    const config: PePlatformHeaderConfig = {
      mainItem: {
        title: this.translateService.translate(titleKey),
      },
      isShowMainItem: true,
      closeItem: {
        title: this.translateService.translate('header.close'),
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: '14px',
        onClick: () => {
          onCancel();
        },
      },
      isShowCloseItem: true,
    }
    setTimeout(() => {
      this.platformHeaderService.setConfig(config);
      this.platformService.microAppReady = 'MICRO_CODE';
    });
  }

  destroyShortHeader(): void {
    // console.info('leak header destroy called');
    // this.platformHeaderService.unregisterComponentCallback('transactionsShortHeader');
  }

  resetHeader(): void {
    // this.platformHeaderService.setPlatformHeader(null);
  }
}
