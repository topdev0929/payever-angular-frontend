import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { MediaUrlPipe } from '@pe/media';
import { PeAuthService } from '@pe/auth';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { PeDataGridSidebarService } from '@pe/data-grid';

@Injectable()
export class ProductsHeaderService {
  businessData: any;
  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  isShowBusinessItemText = true;
  isSubheaderMode = false;

  destroyed$: Subject<void> = new Subject<void>();
  isInitialized = false;

  get businessLogo(): string {
    if (!this.businessData) {
      return;
    }
    return this.mediaUrlPipe.transform(this.businessData.logo, 'images');
  }

  constructor(
    private router: Router,
    private mediaUrlPipe: MediaUrlPipe,
    private authService: PeAuthService,
    private platformHeaderService: PePlatformHeaderService,
    private dataGridSidebarService: PeDataGridSidebarService,
  ) {}

  init(): void {
    this.setHeaderConfig();
  }

  /**
   * Destroy service to remove it logic when switching to another app with own header
   */
  destroy(): void {
    this.isInitialized = false;
    this.platformHeaderService.assignConfig(null);
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSearchClick = () => {
    console.warn('No such method, check CommerceOs');
  }

  onNotificationsClick = () => {
    console.warn('No such method, check CommerceOs');
  }

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  }

  onLogOut = () => {
    this.authService.logout().subscribe();
  }

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  }

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  }

  onContactClick = () => {
    window.open(this.contactHref);
  }

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  }

  onMainItemClick = () => {
    console.warn('No such method, check CommerceOs');
  }

  onAddProductClick = () => {};

  setHeaderConfig(): void {
    const config: PePlatformHeaderConfig = {
      isShowSubheader: false,
      mainDashboardUrl: ``,
      currentMicroBaseUrl: ``,
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {
          this.dataGridSidebarService.toggleFilters$.next();
        },
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'products-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,
    } as PePlatformHeaderConfig;

    this.platformHeaderService.assignConfig(config);
  }
}
