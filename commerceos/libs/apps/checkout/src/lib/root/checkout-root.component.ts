import { ChangeDetectionStrategy, Component, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Params, Router } from '@angular/router';
import { ResizedEvent } from 'angular-resize-event';
import { isString } from 'lodash-es';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EnvService, MessageBus } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeSimpleStepperService } from '@pe/stepper';
import { WallpaperService } from '@pe/wallpaper';

import { PeCheckoutHeaderService } from '../services/checkout-header.service';

@Component({
  selector: 'cos-checkout-root',
  templateUrl: './checkout-root.component.html',
  styleUrls: ['./checkout-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosCheckoutRootComponent implements OnInit, OnDestroy {
  hideHeader: boolean;
  destroy$ = new Subject<void>();

  platformHeaderHeight$ = new BehaviorSubject(0);
  welcomeStepperHeight$ = new BehaviorSubject(0);

  isDashboardRoute: boolean;

  constructor(
    public router: Router,
    protected injector: Injector,
    private messageBus: MessageBus,
    private envService: EnvService,
    public peSimpleStepperService: PeSimpleStepperService,
    private translateService: TranslateService,
    private pePlatformHeaderService: PeCheckoutHeaderService,
    private wallpaperService: WallpaperService,
  ) {
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
  }


  ngOnInit() {

    (window as any)?.PayeverStatic?.IconLoader?.loadIcons([
      'apps',
      'set',
    ]);

    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.hideHeader = event.url.includes('/channels/');
          this.isDashboardRoute = event.urlAfterRedirects.split('/').reverse()[0] === 'dashboard';
          this.pePlatformHeaderService.reassign();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'dashboard';

    // Hide old platform header because new checkout root component uses new platform header

    this.pePlatformHeaderService.init();

    this.peSimpleStepperService.hide();

    this.messageBus.listen('checkout.navigate-to-app').pipe(
      tap((data) => {
        if (isString(data)) {
          this.router.navigate([`business/${this.envService.businessId}/${data}`]);
        } else {
          const dataEx = data as { url: string, getParams?: Params; };
          this.router.navigate([`business/${this.envService.businessId}/${dataEx.url}`],
            { queryParams: dataEx.getParams });
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('checkout.back-to-dashboard').pipe(
      tap(() => this.router.navigate([`business/${this.envService.businessId}/info/overview`])),
      takeUntil(this.destroy$),
    ).subscribe();

    // TODO Remove when deprecated welcome stepper will be completely removed
    const deprecated = document.getElementById('cos-deprecated-simple-welcome-stepper');
    if (deprecated) {
      deprecated.style.marginTop = '-10000px';
    }
  }

  ngOnDestroy() {
    this.pePlatformHeaderService.destroy();
    this.destroy$.next();

    // TODO Remove when deprecated welcome stepper will be completely removed
    const deprecated = document.getElementById('cos-deprecated-simple-welcome-stepper');
    if (deprecated) {
      deprecated.style.marginTop = null;
    }
  }

  onPlatformHeaderResized(event: ResizedEvent) {
    this.platformHeaderHeight$.next(event.newHeight);
  }

  onWelcomeStepperResized(event: ResizedEvent) {
    this.welcomeStepperHeight$.next(event.newHeight);
  }
}
