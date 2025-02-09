/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { BreakpointObserver } from '@angular/cdk/layout';
import { InjectFlags, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { BusinessInterface } from '@pe/business';
import { APP_TYPE, AppSetUpStatusEnum } from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { TranslateService } from "@pe/i18n";
import { MediaUrlPipe } from '@pe/media';
import { PeMessageOverlayService } from '@pe/message';
import { MessageService } from '@pe/message/shared';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderItem, PePlatformHeaderService } from '@pe/platform-header';
import { SearchOverlayComponent, SearchOverlayService } from '@pe/search-dashboard';
import { StateUserService, BusinessState } from '@pe/user';
import { WelcomeScreenService } from '@pe/welcome-screen';

import { AddBusinessOverlayComponent } from '../components';
import { ModuleLoaderService } from '../module-loader.module';

export class BaseHeaderService {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];

  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  hideBusinessItemTextMaxWidth = 721;
  subheaderMaxWidth = 720;
  unreadMessageCount = 0;
  isShowBusinessItemText = true;
  isSubheaderMode: boolean = window.innerWidth <= this.subheaderMaxWidth;
  theme: any;
  messageOverlayService: PeMessageOverlayService;
  isEnableAppMessage = false;

  destroy$ = new Subject<void>();
  isInitialized = false;

  get businessLogo() {
    if (!this.businessData) {
      return '';
    }

    return this.mediaUrlPipe.transform(this.businessData.logo, 'images');
  }

  get appName(): string {
    try {
      const app = this.router.url.includes('welcome/')
        ? this.router.url.split('welcome/')[1]?.split('/')[0]
        : this.router.url.split('business/')[1]?.split('/')[1] || this.router.url.split('personal/')[1]?.split('/')[1];

      if (app === 'info') {
        return 'commerceos'
      }
      if (app.includes('?')) {
        return app.split('?')[0]
      }

      return app;
    } catch (err) {
      this.apmService.apm.captureError(`Error: ${err}\n${JSON.stringify(this.router.url)}`);

      return this.appType || '';
    }
  }

  protected router: Router = this.injector.get(Router);
  protected mediaUrlPipe: MediaUrlPipe = this.injector.get(MediaUrlPipe);
  protected search: SearchOverlayService = this.injector.get(SearchOverlayService);
  protected authService: PeAuthService = this.injector.get(PeAuthService);
  protected platformHeaderService: PePlatformHeaderService = this.injector.get(PePlatformHeaderService);
  protected breakpointObserver: BreakpointObserver = this.injector.get(BreakpointObserver);
  protected overlay: PeOverlayWidgetService = this.injector.get(PeOverlayWidgetService);
  protected apiService: ApiService = this.injector.get(ApiService);
  protected messageService: MessageService = this.injector.get(MessageService);
  protected route: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected cosEnvService: CosEnvService = this.injector.get(CosEnvService);
  private apmService = this.injector.get(ApmService);
  private appType = this.injector.get(APP_TYPE, 'commerceos' as string, InjectFlags.Optional);
  private welcomeScreen: WelcomeScreenService = this.injector.get(WelcomeScreenService);
  protected translateService = this.injector.get(TranslateService);
  private moduleLoaderService: ModuleLoaderService = this.injector.get(ModuleLoaderService)
  protected stateUserService: StateUserService = this.injector.get(StateUserService);

  constructor(
    protected injector: Injector,
  ) {
    this.messageService.isEnableAppMessage$.pipe(
      tap((isEnableAppMessage) => {
        this.isEnableAppMessage = isEnableAppMessage;
      })).subscribe();
  }

  initHeaderObservers() {
    /**
     * Listen to close button click. Works only for lazy-loaded micro. (Different router instances)
     */
    this.platformHeaderService.closeButtonClicked$
      .asObservable()
      .pipe(
        tap(() => {
          if (this.platformHeaderService.config?.isShowShortHeader) {
            this.router
              .navigateByUrl(this.platformHeaderService.config.currentMicroBaseUrl)
              .then(() => this.platformHeaderService.setFullHeader());
          } else {
            this.router.navigate([
              this.platformHeaderService.config.mainDashboardUrl || `/business/${this.businessData._id}/info/overview`,
            ]);
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

  }

  /**
   * Destroy service to remove it logic when switching to another app with own header
   */
  destroy(): void {
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroy$.next();
  }

  onSearchClick = () => {
    this.search.open(SearchOverlayComponent);
  };

  onNotificationsClick = () => {};

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher']).then(() => {
      this.messageService.closeMessages$.next(null);
    });
  };

  onLogOut = () => {
    this.authService.logout().subscribe();
    this.messageService.closeMessages$.next(null);
  };

  onAddBusinessClick = () => {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: AddBusinessOverlayComponent,
      data: {
        businessRegistrationData: null,
      },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: this.translateService.translate('header.add-business.title'),
        backBtnTitle: this.translateService.translate('header.add-business.back'),
        backBtnCallback: () => {
          this.overlay.close();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {},
        doneBtnTitle: this.translateService.translate('header.add-business.done'),
        doneBtnCallback: () => {},
      },
    };

    this.apiService
      .getBusinessRegistrationData()
      .pipe(
        take(1),
        tap((data) => {
          config.data.businessRegistrationData = data;
          this.overlay.open(config);
        }),
      )
      .subscribe();
  };

  openPersonalProfile = () => {
    this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);
  };

  navigateToThemes = () => {};

  navigateToSettings = () => {};

  navigateToDashboard = () => {};

  navigateToEdit = () => {};

  navigateToBuilder = () => {};

  onContactClick = () => {
    window.open(this.contactHref);
  };

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  };

  onMainItemClick = () => { };

  setHeaderConfig(headerConfig: PePlatformHeaderConfig): void {

    this.messageService.setAppName$.next(this.appName);

    const isShortHeader = headerConfig?.isShowShortHeader ?? this.platformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem =
      headerConfig?.shortHeaderTitleItem ?? this.platformHeaderService.config?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      isShowSubheader: this.isSubheaderMode,
      mainDashboardUrl: headerConfig.mainDashboardUrl || '',
      currentMicroBaseUrl: headerConfig.currentMicroBaseUrl || '',
      leftSectionItems: headerConfig.leftSectionItems || [],
      isShowShortHeader: isShortHeader,
      mainItem: headerConfig.mainItem || null,
      isShowMainItem: headerConfig.isShowMainItem || true,
      closeItem: headerConfig.closeItem || {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        showIconBefore: true,
        iconType: 'vector',
        iconSize: '22px',
      },
      isShowCloseItem: true,
      isShowDataGridToggleComponent: headerConfig.isShowDataGridToggleComponent,
      showDataGridToggleItem: headerConfig.showDataGridToggleItem || {},

      rightSectionItems: headerConfig.rightSectionItems || [
        {
          icon: '#icon-menu-search-24',
          iconSize: this.isSubheaderMode ? '22px' : '24px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-menu-hamburger-24',
          iconSize: this.isSubheaderMode ? '22px' : '24px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch-block-16',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.switch_business'),
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-person-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-n-launch',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-contact-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-star-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick,
            },
            {
              icon: '#icon-logout-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut,
            },
          ],
        },
      ],
      businessItem: headerConfig.businessItem || {
        icon: this.businessData && this.businessLogo ? this.businessLogo : '#icon-menu-avatar-24',
        iconSize: this.isSubheaderMode ? '22px' : '24px',
        iconType: this.businessData && this.businessLogo ? 'raster' : 'vector',
        onClick: () => {
          this.router.navigateByUrl(`business/${this.businessData._id}/settings/info`);
        },
      },
      isShowBusinessItem: headerConfig.isShowBusinessItem || true,
      shortHeaderTitleItem,
      isShowBusinessItemText: headerConfig.isShowBusinessItemText || this.isShowBusinessItemText,
    };

    this.platformHeaderService.setConfig(config);

    const app = this.dockerItems?.find(item => item.code === this.appName);
    if (app?.setupStatus === AppSetUpStatusEnum.NotStarted
      && this.router.url !== '/switcher'
      && !this.router.url.includes('/info/overview')) {
      this.stateUserService.isNewUser$.pipe(
        take(1),
        tap((isNewUser)=>{
          if (!isNewUser){
            this.welcomeScreen.show();
          }
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }

    if (!this.route.snapshot.queryParams?.fromTODO) {
      this.messageService.closeMessages$.next(null);
    }

  }

  toggleMessages() {

    if (this.messageOverlayService) {
      this.messageOverlayService.toggleMessages();

      return;
    }
    import('@pe/message').then(({ PeMessageOverlayService }) => {
      this.moduleLoaderService.loadModule().then((moduleRef) => {
        this.messageOverlayService = moduleRef.injector.get(PeMessageOverlayService);
        this.messageOverlayService.toggleMessages();
      });
    });


  }


  refreshUnreadMessages(config: PePlatformHeaderConfig): void {
    const unreadMessages = this.unreadMessageCount === 0 ? '' : this.unreadMessageCount.toString();
    const notifications =  this.unreadMessageCount > 99 ? '99+' : unreadMessages;
    const messageItem: PePlatformHeaderItem = {
      icon: '#icon-menu-messages-24',
      iconSize: this.isSubheaderMode ? '22px' : '24px',
      iconType: 'vector',
      notifications,
      onClick: () => this.toggleMessages(),
    };
    const rightSectionItems = [messageItem, ...config?.rightSectionItems ?? []];
    this.platformHeaderService.assignConfig({ rightSectionItems });
  }
}
