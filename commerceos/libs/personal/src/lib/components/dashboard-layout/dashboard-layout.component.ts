import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { first, map, shareReplay, takeUntil } from 'rxjs/operators';

import { ApiService } from '@pe/api';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { LoaderService } from '@pe/app-launcher';
import { AuthUserData, PeAuthService } from '@pe/auth';
import { appsLaunchedByEvent } from '@pe/base';
import { DashboardDataService } from '@pe/base-dashboard';
import { BusinessInterface } from '@pe/business';
import { MicroAppInterface, MicroRegistryService, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PlatformService } from '@pe/platform';
import { PeUser, UserState, BusinessState, ResetBusinessState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';
import { AbstractDashboardComponent } from '@pe/zendesk';

@Component({
  selector: 'personal-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class PersonalDashboardLayoutComponent extends AbstractDashboardComponent implements OnInit {
  @Select(UserState.user) user$: Observable<PeUser>;
  @Select(BusinessState.businesses) businessesData$: Observable<{businesses: BusinessInterface[], total: number}>;

  backToBusiness$: Observable<boolean>;

  businessData =  JSON.parse(localStorage.getItem('pe_opened_business'));

  constructor(
    injector: Injector,
    private authService: PeAuthService,
    public dashboardDataService: DashboardDataService,
    private translateService: TranslateService,
    private loaderService: LoaderService,
    private microRegistryService: MicroRegistryService,
    private apiService: ApiService,
    private router: Router,
    private platformService: PlatformService,
    protected wallpaperService: WallpaperService,
    private store: Store,
    private readonly destroy$: PeDestroyService,
  ) {
    super(injector);
    this.apiService.getUserAccount().pipe(first()).subscribe((user) => {
      this.dashboardDataService.logo = user['logo'];
      this.dashboardDataService.userName = user['firstName'] || null;
    });
    this.dashboardDataService.showEditAppsButton = false;
    this.dashboardDataService.showCloseAppsButton = false;
  };

  ngOnInit(): void {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'set',
    ]);

    this.backToBusiness$ = this.businessesData$.pipe(
      map(businessesData => !!businessesData.total),
      shareReplay(1),
    );

    this.backgroundImage = this.wallpaperService.blurredBackgroundImage;
    super.ngOnInit();

    this.showChatButton();
    this.platformService.backToDashboard$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.showChatButton();
    });

    this.loaderService.appLoading$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => this.hideChatButton());

    this.store.dispatch(new ResetBusinessState());
  }

  navigateToSwitcher(): void {
    this.router.navigate(['/switcher']);
  }

  navigateToDashboard() {
    if (this.businessData) {
      this.router.navigate([`business/${this.businessData._id}/info/overview`]);
    } else {
      this.navigateToSwitcher();
    }
  }

  protected initDocker(infoBox?: string): void {
    const microList: MicroAppInterface[] = this.microRegistryService.getMicroConfig('') as MicroAppInterface[];
    this.dockerItems = microList
      .filter((micro: any) => !!micro.dashboardInfo && Object.keys(micro.dashboardInfo).length > 0)
      .map((micro: MicroAppInterface) => {
        const result: any = {};
        result.icon = micro.dashboardInfo.icon;
        result.title = this.translateService.translate(micro.dashboardInfo.title);
        result.onSelect = (active: boolean) => {
          this.onAppSelected(micro, active);
        };
        result.installed = micro.installed;
        result.order = micro.order;
        result.microUuid = micro._id;
        result.code = micro.code;
        result.setupStatus = micro.setupStatus;

        return result;
      });
    this.dashboardDataService.apps(this.dockerItems);
  }

  private onAppSelected(micro: MicroAppInterface, active: boolean): void {
    this.loaderService.appLoading = micro.code;
    this.wallpaperService.showDashboardBackground(false);

    const userData: AuthUserData = this.authService.getUserData();

    if (userData) {
      this.loadMicroApp(userData.uuid, micro);
    }
  }

  private loadMicroApp(userId: string, micro: MicroAppInterface): void {
    const microName: string = micro.code;
    const config: any = this.microRegistryService.getMicroConfig(microName);


    let loadObservable$: Observable<boolean> = of(true);
    if (appsLaunchedByEvent.indexOf(config.code) > -1) {
      loadObservable$ = this.microRegistryService.loadBuild(config);
    }

    loadObservable$.subscribe(() => {
      // NOTE: delay done for IE. When open app twice IE do not show spinner and do redirect immidiatelly
      // Make small delay to show spinner above the app icon
      setTimeout(
        () => this.router.navigateByUrl(config.url.replace('{uuid}', userId))
          .then(() => this.loaderService.appLoading = null),
        100,
      );
    });
  }
}
