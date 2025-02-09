import { Component, ElementRef, HostBinding, OnDestroy, OnInit, TestabilityRegistry } from '@angular/core';
import { Router } from '@angular/router';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent, DashboardEventEnum, PlatformService } from '@pe/ng-kit/modules/common';
import { PeStepperService, PeWelcomeStep, PeWelcomeStepAction, PeWelcomeStepperAction,  PeWelcomeStepperEvent } from '@pe/stepper';
import { environment } from '../../../../environments/environment';
import { ThemeData } from '../../../../modules-new/core/theme.data';

@Component({
  selector: 'app-builder', // tslint:disable-line
  templateUrl: 'root.component.html',
  styleUrls: ['root.component.scss'],
})
export class RootComponent extends AbstractComponent implements OnDestroy, OnInit {
  @HostBinding('class.is-dev')
  isDev = !environment.production;

  @HostBinding('class.is-stepper')
  isStepper = true;

  constructor(
    private registry: TestabilityRegistry,
    private element: ElementRef,
    private router: Router,
    private platformService: PlatformService,
    private peStepperService: PeStepperService,
    private themeData: ThemeData,
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.peStepperService.isActiveStored) {
      this.peStepperService.continue$.pipe(
        takeUntil(this.destroyed$),
        filter(e => !!e && !!e.nextStep && e.nextStep.action === PeWelcomeStepAction.UploadProduct),
        tap(() => this.goToProductsApp()),
      ).subscribe();
    }

    this.platformService.microNavigation$.pipe(
        tap((microPath: string | any) => {
          const separators = ['/', '\\\?'];
          const currentlyOpenedApp: string = location.pathname.split(new RegExp(separators.join('|'), 'g'))[3];
          // NOTE: need to check currently opened app because builder can be opened in marketing app
          // and then currentlyOpenedApp === 'marketing'
          if (currentlyOpenedApp === 'builder' && isNavigationToBuilder(microPath)) {
            this.platformService.microLoaded = true;

            this.router.navigate(
              [ this.getNavigationUrl(microPath) ],
              {
                queryParams: getQueryParams(microPath),
              },
            ).then().catch();
          }
        }),
        takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.registry.unregisterApplication(this.element.nativeElement);
  }

  private getNavigationUrl(microPath: string | any): string {
    const url: string = typeof microPath === 'string' ? microPath : microPath.url;

    return `business/${this.themeData.businessId}/${url}`;
  }

  private goToProductsApp(): void {
    this.platformService.dispatchEvent({
      target: DashboardEventEnum.MicroNavigation,
      action: '',
      data: {
        url: 'products/select-products',
        getParams: {
          embedded: true,
          app: 'shop',
          parentAppId: this.themeData.context.applicationId,
          parentApp: this.themeData.context.applicationType,
          appId: this.themeData.context.applicationId,
          channelSet: this.themeData.context.channelSet,
          stepper: true,
        },
      },
    });
  }
}

const getQueryParams = (microPath: string | any): any => {
  let queryParams: any = {};

  if (typeof microPath !== 'string') {
    queryParams = microPath.getParams;
  }

  return queryParams;
};

const isNavigationToBuilder = (microPath: string | any): boolean => {
  let toBuilder = false;
  const url: string = typeof microPath === 'string' ? microPath : microPath.url;

  const splittedUrl: string[] = url.split('/');
  if (splittedUrl.length > 0 && splittedUrl[0] === 'builder') {
    toBuilder = true;
  }

  return toBuilder;
};
