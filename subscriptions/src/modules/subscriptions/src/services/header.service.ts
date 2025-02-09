import { Location } from '@angular/common';
import { Injectable, OnDestroy, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { PeSubscriptionSidebarService } from './sidebar.service';
import { AbstractService } from '../shared/abstract';

@Injectable({ providedIn: 'root' })
export class HeaderService extends AbstractService implements OnDestroy {
  businessData: any;
  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  isShowBusinessItemText = true;
  isSubheaderMode = false;

  isInitialized = false;

  route$: any;

  get businessId() {
    return this.location.path().split('/')[2];
  }

  isActive = false;

  isDataGridSidebarActiveStream$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isDataGridSidebarActive$ = this.isDataGridSidebarActiveStream$.asObservable();

  public get isDataGridSidebarActive(): boolean {
    return this.isDataGridSidebarActiveStream$.value;
  }

  public set isDataGridSidebarActive(v: boolean) {
    this.isDataGridSidebarActiveStream$.next(v);
  }

  constructor(
    private router: Router,
    private authService: PeAuthService,
    private sidebarService: PeSubscriptionSidebarService,
    @Optional() private pePlatformHeaderService: PePlatformHeaderService,
    private location: Location,
  ) {
    super();
  }

  initHeader() {
    this.pePlatformHeaderService.setFullHeader();
  }

  setHeaderConfig(): void {
    const isShortHeader = false;

    const config: PePlatformHeaderConfig = {
      isShowSubheader: false,
      mainDashboardUrl: '/subscriptions/programs',
      currentMicroBaseUrl: '/subscriptions',
      isShowShortHeader: isShortHeader,
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: this.onToggleSidebar.bind(this),
      },
      isShowMainItem: false,
      mainItem: {
        title: `Subscriptions`,
      },
      isShowCloseItem: true,
      closeItem: {
        title: 'Back to Apps',
        icon: '#icon-apps-apps',
        iconType: 'vector',
        iconSize: '18px',
        class: 'close-button-subscriptions',
      },
      leftSectionItems: [],
      rightSectionItems: [
        {
          icon: '#icon-menu-search',
          iconSize: '16px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-n-bell-32',
          iconSize: '16px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-hamburger-16',
          iconSize: '16px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '16px',
              iconType: 'vector',
              title: 'Switch Business',
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '16px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-add-business',
              iconSize: '16px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-log_out',
              iconSize: '16px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut,
            },
            {
              icon: '#icon-contact',
              iconSize: '16px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-feedback',
              iconSize: '16px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick,
            },
          ],
        },
      ],
      businessItem: {
        title: '',
        icon: '#icon-account-circle-24',
        iconSize: '16px',
        iconType: 'vector',
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: true,
    };

    this.pePlatformHeaderService.setConfig(config);
  }
  onToggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  onToggleDataGrid() {
    this.isDataGridSidebarActiveStream$.next(!this.isDataGridSidebarActiveStream$.value);
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
}
