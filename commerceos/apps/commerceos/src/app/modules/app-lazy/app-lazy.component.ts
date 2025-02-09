import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, Optional, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { LazyAppsLoaderService } from '@pe/app-launcher';
import { PeAuthService } from '@pe/auth';
import { BusinessInterface } from '@pe/business';
import { APP_TYPE, AppThemeEnum, AppType, PeDestroyService } from '@pe/common';
import { loadStyles, removeStyle } from '@pe/lazy-styles-loader';
import { PlatformEventInterface, PlatformService } from '@pe/platform';
import { BusinessState, ResetBusinessState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';
import { WindowService } from '@pe/window';

import { notificationsTransition } from '../../animations/dashboard.animation';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-lazy',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [notificationsTransition],
  providers: [
    PeDestroyService,
  ],
})
export class AppLazyComponent implements OnInit, OnDestroy {
  @Select(BusinessState.businessData) readonly business$: Observable<BusinessInterface>;

  backgroundImage: string;

  constructor(
    public wallpaperService: WallpaperService,
    private platformService: PlatformService,
    private lazyAppsLoaderService: LazyAppsLoaderService,
    private authService: PeAuthService,
    private router: Router,
    private store: Store,
    private renderer: Renderer2,
    private readonly destroy$: PeDestroyService,
    private apmService: ApmService,
    private windowService: WindowService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngOnInit() {
    const registrationPath = ['login', 'switcher', 'registration', 'password'];
    this.business$.pipe(
      tap((data) => {
        const urlPath = this.router.url.split('/')[1];

        this.wallpaperService.backgroundImage = data?.currentWallpaper?.wallpaper ||
          (urlPath !== 'switcher'
            ? this.wallpaperService.defaultBackgroundImage
            : this.wallpaperService.defaultBlurredBackgroundImage);

        if (registrationPath.includes(urlPath)) {
          if (urlPath !== 'switcher' || !document.getElementById('pe-theme')){
              removeStyle('pe-theme');
            }
        } else if (data?.themeSettings?.theme !== AppThemeEnum.dark) {
            loadStyles([{ name: data?.themeSettings?.theme, id:"pe-theme" }]);
        } else {
          removeStyle("pe-theme");
        }
      })
      ,takeUntil(this.destroy$),
    ).subscribe();
    const backToDashboard$ = this.platformService.backToDashboard$.pipe(tap(async (event: PlatformEventInterface) => {
      const [dashboardType, businessUuid] = this.router.url.split('/');
      this.store.dispatch(new ResetBusinessState());
      let navigatePath: any[];
      if (dashboardType === 'personal') {
        navigatePath = [`/personal/${this.authService.getUserData().uuid}`];
      } else {
        navigatePath = [`/business/${businessUuid || ''}`];
      }
      if (event.action !== 'commerceos') {
        await this.router.navigate(navigatePath);
      }

      this.lazyAppsLoaderService.clearMicroContainerElement();

      this.platformService.microAppReady = '';

    }));

    merge(
      this.authService.error$.pipe(tap(error => error && this.apmService?.apm?.captureError(error))),
      this.wallpaperService.backgroundImage$.pipe(tap(image => this.backgroundImage = `url(${image})`)),
      backToDashboard$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    merge(
      this.windowService.width$,
      this.windowService.height$
    ).pipe(
      tap(()=> {
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('--app-width', `${window.innerWidth}px`);
      }),
    takeUntil(this.destroy$))
    .subscribe();

  }
}
