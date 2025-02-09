import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject, Subject } from 'rxjs';

import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { PePlatformHeaderItem } from '@pe/platform-header/platform-header.types';
import { PebShippingSidebarService } from './sidebar.service';
import { PeAuthService } from '@pe/auth';

@Injectable({ providedIn: 'any' })
export class ShippingHeaderService {
  businessData: any;
  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  isShowBusinessItemText = true;
  isSubheaderMode = false;

  destroyed$: Subject<void> = new Subject<void>();
  isInitialized = false;

  isSidebarActiveStream$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSidebarActive$ = this.isSidebarActiveStream$.asObservable();

  public get isSidebarActive(): boolean {
    return this.isSidebarActiveStream$.value;
  }

  public set isSidebarActive(v: boolean) {
    this.isSidebarActiveStream$.next(v);
  }

  constructor(
    private router: Router,
    private authService: PeAuthService,
    private sidebarService: PebShippingSidebarService,
    @Optional() private platformHeaderService: PePlatformHeaderService,
  ) {}

  init(): void {
    this.setHeaderConfig();
  }

  setHeaderConfig(): void {
    const isShortHeader: boolean = this.platformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem: PePlatformHeaderItem = this.platformHeaderService.config?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      isShowSubheader: false,
      mainDashboardUrl: 'shipping/options',
      currentMicroBaseUrl: 'shipping',
      isShowShortHeader: false,
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: () => {
          this.sidebarService.toggleSidebar();
        },
      },
      isShowMainItem: false,
      mainItem: {
        title: `Shipping`,
      },
      isShowCloseItem: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-apps',
        showIconBefore: true,
        iconType: 'vector',
        iconSize: '14px',
      },
      leftSectionItems: [],
      rightSectionItems: [
        {
          icon: '#icon-apps-header-notification',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-apps-header-search',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-apps-header-hamburger',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Switch Business',
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-add-business',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-log_out',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut,
            },
            {
              icon: '#icon-contact',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-feedback',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick,
            },
          ],
        },
      ],
      businessItem: {
        title: this.businessData?.name || '',
        icon: this.businessData?.logo || '#icon-account-circle-24',
        iconSize: '16px',
        iconType: 'vector',
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: true,
    };

    this.platformHeaderService.setConfig(config);
  }

  onToggleSidebar() {
    this.isSidebarActiveStream$.next(!this.isSidebarActiveStream$.value);
  }

  onSearchClick = () => {
    console.warn('No such method, check CommerceOs');
  };

  onNotificationsClick = () => {
    console.warn('No such method, check CommerceOs');
  };

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  };

  onLogOut = () => {
    this.authService.logout().subscribe();
  };

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  };

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  };

  onContactClick = () => {
    window.open(this.contactHref);
  };

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  };

  onMainItemClick = () => {
    console.warn('No such method, check CommerceOs');
  };
}
