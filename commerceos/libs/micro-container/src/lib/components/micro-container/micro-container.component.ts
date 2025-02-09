import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router, UrlSegment } from '@angular/router';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { LazyAppsLoaderService } from '@pe/app-launcher';
import { appsLaunchedByEvent } from '@pe/base';
import { BusinessInterface } from '@pe/business';
import {
  MicroAppDashboardInfoInterface,
  MicroAppInterface as LocalMicroAppInterface,
  MicroLoaderService,
  MicroRegistryService,
  PeDestroyService,
} from '@pe/common';
import { LoaderStateEnum, PlatformService } from '@pe/platform';
import { PeSimpleStepperService, PeStepperService } from '@pe/stepper';
import { BusinessDataLoaded, BusinessState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';
import { WelcomeScreenService } from '@pe/welcome-screen';

import { PeMicroHeaderService } from '../../services/micro-header.service';


interface AppInfo {
  icon: string;
  title: string;
}

@Component({
  selector: 'micro-container-component',
  templateUrl: './micro-container.component.html',
  styleUrls: ['micro-container.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    WelcomeScreenService,
    PeDestroyService,
  ],
})
export class MicroContainerComponent implements OnInit, OnDestroy {
  @ViewChild('micro', { static: true }) microContainer: ElementRef;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  showAlertInHeader$: Observable<boolean> = this.platformService.internetConnectionStatus$.pipe(
    map(connected => !connected),
    distinctUntilChanged(),
  );

  appInfo: AppInfo;
  businessUuid: string;
  belowHeader = false;
  belowSubheader = false;
  hideLoader$: Observable<boolean> = this.platformService.microLoading$.pipe(
    map((loading: LoaderStateEnum) => this.peStepperService.isActiveStored || loading !== LoaderStateEnum.Loading),
  );

  isActiveWelcomeStepperWithDebounce$ = new BehaviorSubject<boolean>(true);
  isWelcomeStep = false;

  tags = {
    settings: '<settings-root></settings-root>',
    transactions: '<transactions-app></transactions-app>',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private walpaper: WallpaperService,
    private lazyAppsLoaderService: LazyAppsLoaderService,
    private microLoaderService: MicroLoaderService,
    private microRegistryService: MicroRegistryService,
    private platformService: PlatformService,
    private studioHeaderService: PeMicroHeaderService,
    private router: Router,
    private store: Store,
    public peStepperService: PeStepperService,
    public peSimpleStepperService: PeSimpleStepperService,
    private welcomeScreenService: WelcomeScreenService,
    private readonly destroy$: PeDestroyService,
  ) { }

  ngOnInit(): void {

    this.studioHeaderService.initialize(this.activatedRoute.snapshot.data.app);

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'settings',
      'builder',
      'dock',
      'edit-panel',
      'social',
      'dashboard',
      'notification',
      'widgets',
      'payment-methods',
      'shipping',
      'banners',
    ]);

    this.walpaper.backgroundImage = this.businessData?.currentWallpaper?.wallpaper
      || this.walpaper.defaultBackgroundImage;

    this.peStepperService.isActive$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(1000),
        filter(v => typeof v === 'boolean'),
        tap(isActive => this.isActiveWelcomeStepperWithDebounce$.next(isActive)),
      )
      .subscribe();

    this.lazyAppsLoaderService.microContainerActive$.next(true);

    this.lazyAppsLoaderService.clearMicroContainerElement();

    this.isWelcomeStep = this.peStepperService.isActiveStored;

    this.platformService.microAppReady$.pipe(takeUntil(this.destroy$)).subscribe(() => {
    });

    combineLatest([this.activatedRoute.parent.url, this.activatedRoute.parent.params])
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: [UrlSegment[], Params]) => {
        this.businessUuid = data[1]['slug'];

        // // here need to separate by ? too, because there maybe router.url like "/business/_id/products?someparams"
        const separators = ['/', '\\?'];
        const microName: string = !this.activatedRoute.snapshot.data['isWelcome']
          ? this.router.url.split(new RegExp(separators.join('|'), 'g'))[3]
          : this.router.url.split(new RegExp(separators.join('|'), 'g'))[4];

        if (this.activatedRoute.snapshot.data['isWelcome']) {
          this.welcomeScreenService.show();
        }
        const config: LocalMicroAppInterface = this.microRegistryService.getMicroConfig(
          microName === 'old-builder' ? 'builder' : microName,
        ) as LocalMicroAppInterface;
        this.microContainer.nativeElement.innerHTML = this.tags[config.code];

        if (!config.installed) {
          this.install(config as LocalMicroAppInterface & MicroAppDashboardInfoInterface);
        }

        if (
          appsLaunchedByEvent.indexOf(config.code) > -1 &&
          this.microLoaderService.isScriptLoadedbyCode(config.code)
        ) {
          window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
        } else if (this.microLoaderService.isScriptLoadedbyCode(config.code)) {
            // if the script already loaded we have to call it
            window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
        } else {
          this.microRegistryService.loadBuild(config).subscribe(() => {
            if (appsLaunchedByEvent.indexOf(config.code) > -1) {
              window.dispatchEvent(new CustomEvent(`pe-run-${config.code}`, {}));
            }
          });
        }

        this.appInfo = { ...config.dashboardInfo };
      });
  }

  ngOnDestroy() {
    const business = JSON.parse(localStorage.getItem('pe_opened_business'));
    this.store.dispatch(new BusinessDataLoaded(business));
    this.lazyAppsLoaderService.microContainerActive$.next(false);
  }

  backToDashboard(): void {
    this.router.navigate(['/business', this.businessUuid]);
  }

  private install(micro: LocalMicroAppInterface & MicroAppDashboardInfoInterface): void {
    micro.installed = true;
    micro.disabledClick = true;
  }
}
