import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { MessageBus, NavigationService } from '@pe/common';
import { MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { BaseHeaderService } from '@pe/shared/header';

@Injectable()
export class PeCheckoutHeaderService extends BaseHeaderService {

  unreadMessages = '';

  constructor(
    protected router: Router,
    protected mediaUrlPipe: MediaUrlPipe,
    protected platformHeaderService: PePlatformHeaderService,
    protected navigationService: NavigationService,
    protected injector: Injector,
    private messageBus: MessageBus,
  ) {
    super(injector);
  }

  reassign() {
    const config = this.getHeaderConfig();
    delete config.showDataGridToggleItem;
    this.platformHeaderService.assignConfig(config);
  }

  init(): void {
    this.initHeaderObservers();
    const config = this.getHeaderConfig();
    this.setHeaderConfig(config);
  }

  getHeaderConfig(): PePlatformHeaderConfig {
    const logo = this.businessData?.logo || null;

    return {
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/checkout` : '',
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {
          this.messageBus.emit('checkout.toggle.sidebar','');
        },
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: this.navigationService?.getReturnUrl()
          ? this.translateService.translate('actions.close')
          : this.translateService.translate('dashboard.header.closeButtonText'),
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'connect-header',
        showIconBefore: true,
      },
      isShowCloseItem: true,
      leftSectionItems: [],
      businessItem: {
        title: this.businessData?.name || '',
        icon:
          logo
            ? this.mediaUrlPipe.transform(logo, 'images')
               : '#icon-menu-avatar-24',
        iconSize: logo ? '18px' : '24px',
        iconType: logo ? 'raster' : 'vector',
        onClick: () => {
          this.router.navigateByUrl(`business/${this.businessData._id}/settings/info`);
        },
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: false,
    };
  }
}
