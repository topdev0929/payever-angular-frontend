import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { PePlatformHeaderItem } from '@pe/platform-header/platform-header.types';
import { MessageBus } from '@pe/common';

@Injectable()
export class ContactsHeaderService {
  businessData: any;
  contactHref: string = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref: string = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  isShowBusinessItemText: boolean = true;

  destroyed$: Subject<void> = new Subject<void>();
  isInitialized: boolean = false;
  isSidebarActiveStream$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private router: Router,
    private authService: PeAuthService,
    private messageBus: MessageBus,
    private platformHeaderService: PePlatformHeaderService,
  ) {
  }

  init(): void {
    this.setHeaderConfig();
  }

  /**
   * Destroy service to remove it logic when switching to another app with own header
   */
  destroy(): void {
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSearchClick = () => {
    // todo: implement the function
  }

  onNotificationsClick = () => {
    // todo: implement the function
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

  setHeaderConfig(): void {
    const isShortHeader: boolean = this.platformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem: PePlatformHeaderItem = this.platformHeaderService.config?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      shortHeaderTitleItem,
      isShowSubheader: false,
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/contacts` : '',
      isShowShortHeader: isShortHeader,
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: () => {
          this.messageBus.emit('contacts.toggle.sidebar', '');
        }
      },
      isShowMainItem: false,
      mainItem: {},
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
          iconSize: '16px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-apps-header-search',
          iconSize: '16px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-apps-header-hamburger',
          iconSize: '16px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Switch Business',
              onClick: this.onSwitchBusinessClick
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile
            },
            {
              icon: '#icon-add-business',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick
            },
            {
              icon: '#icon-log_out',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut
            },
            {
              icon: '#icon-contact',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick
            },
            {
              icon: '#icon-feedback',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick
            }
          ]
        },
      ],
      businessItem: {
        title: this.businessData?.name || '',
        icon: this.businessData?.logo || '#icon-account-circle-24',
        iconSize: '16px',
        iconType: 'vector',
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: true
    };

    this.platformHeaderService.setConfig(config);
  }
}
