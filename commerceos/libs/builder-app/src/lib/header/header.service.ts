import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngxs/store';

import { PebSetSidebarsAction, PebSidebarsState } from '@pe/builder/state';
import { PePlatformHeaderService } from '@pe/platform-header';
import { BaseHeaderService } from '@pe/shared/header';


@Injectable()
export class PeHeaderService extends BaseHeaderService {

  constructor(
    protected platformHeaderService: PePlatformHeaderService,
    protected injector: Injector,
    private store: Store
  ) {
    super(injector);
  }

  /**
   * Initializing service subscriptions
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }
    this.initHeaderObservers();
    this.isInitialized = true;
    this.setShopHeaderConfig();
  }

  onSidebarToggle = () => {
    const { left } = this.store.selectSnapshot(PebSidebarsState.sidebars);

    this.store.dispatch(new PebSetSidebarsAction({ left: !left }));
  }

  setShopHeaderConfig(): void {
    this.setHeaderConfig({
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/shop` : '',
      isShowShortHeader: null,
      mainItem: {},
      isShowMainItem: false,
      showDataGridToggleItem: {
        iconSize: '24px',
        iconType: 'vector',
        onClick: this.onSidebarToggle,
        isActive: true,
        isLoading: true,
        showIconBefore: true,
      },
      isShowCloseItem: true,
      isShowDataGridToggleComponent: true,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: null,
      leftSectionItems: [],
    });
  }

  destroy() {
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroy$.next();
  }
}
