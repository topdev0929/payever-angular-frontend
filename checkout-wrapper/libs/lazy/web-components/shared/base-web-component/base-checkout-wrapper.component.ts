import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  HostBinding,
  Injector,
  Input,
  Output,
  createNgModule,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { BehaviorSubject, of, timer } from 'rxjs';
import { delay, map, retryWhen } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { CustomElementWrapperComponent } from '@pe/checkout/elements';
import { CheckoutEventInterface, CheckoutPluginEventEnum } from '@pe/checkout/plugins';
import { GetSettings } from '@pe/checkout/store';
import {
  CheckoutStateParamsInterface,
  FlowInterface,
  CheckoutSettingsInterface,
  TimestampEvent,
} from '@pe/checkout/types';
import type { SnackBarService } from '@pe/checkout/ui/snackbar';
import { WindowEventsService } from '@pe/checkout/window';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

declare function initMerchantSkeletonStyle(data: any, envCommerceos: string): void;

@Directive() // Has to be here to make work @Input in abstract class
export abstract class BaseCheckoutWrapperComponent extends CustomElementWrapperComponent {

  @Output() eventEmitted: EventEmitter<CheckoutEventInterface> = new EventEmitter();
  @Output() flowCloned: EventEmitter<{cloned: FlowInterface}> = new EventEmitter();
  @Output() layoutShown: EventEmitter<void> = new EventEmitter();

  @HostBinding('class.pe-checkout-bootstrap') hostClass = true;
  @HostBinding('attr.id') hostId = 'pe-checkout-skeleton-wrapper';

  skeleton$: BehaviorSubject<SafeHtml> = new BehaviorSubject<SafeHtml>(null);

  protected windowEventsService: WindowEventsService = this.injector.get(WindowEventsService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  protected apiService: ApiService = this.injector.get(ApiService);
  protected store = this.injector.get(Store);

  private snackbarService: SnackBarService;
  private isSkeletonProcessed = false;

  constructor(protected injector: Injector) {
    super(injector);
    this.initEventsHandler();
  }

  abstract getFlowId(): string;

  updateSteps$ = new EventEmitter<void>();
  @Input('updateSteps') set setUpdateSteps(value: any) {
    this.updateSteps$.next();
  }

  openOrderStep$ = new EventEmitter<void>();
  @Input('openOrderStep') set setOpenOrderStep(value: any) {
    this.openOrderStep$.next();
  }

  updateFlow$ = new EventEmitter<void>();
  @Input('updateFlow') set setUpdateFlow(value: any) {
    this.updateFlow$.next();
  }

  updateSettings$ = new BehaviorSubject<TimestampEvent>(null);
  @Input('updateSettings') set setUpdateSettings(value: any) {
    this.updateSettings$.next(this.parseInputObject(value));
  }

  saveFlowToStorage$ = new EventEmitter<string>();
  @Input('saveFlowToStorage') set setSaveFlowToStorage(paymentLinkId: string) {
    this.saveFlowToStorage$.next(paymentLinkId);
  }

  disableLocaleDetection = false;
  @Input('disableLocaleDetection') set setDisableLocaleDetection(value: boolean) {
    this.disableLocaleDetection = value;
  }

  params: CheckoutStateParamsInterface = {};
  @Input('params') set setParams(value: CheckoutStateParamsInterface) {
    this.params = value;
    if (Object.keys(value).length !== 0) {
      (window as any).peCheckoutParams = this.params;
    }
  }

  fixedPosition = false;
  @Input('fixedPosition') set setFixedPosition(value: boolean) {
    this.fixedPosition = value;
  }

  checkoutHidden = false;
  @Input('checkoutHidden') set setCheckoutHidden(value: any) {
    this.checkoutHidden = this.parseInputBoolean(value);
  }

  onLayoutShown(): void {
    this.layoutShown.emit();
  }

  onCustomElementReady(): void {
    return;
  }

  protected getIconsPack(): string[] {
    return [
      'set',
      'banners', // For #icon-info-16 in Norway Micro
      'payment',
      'payment-methods',
      'shipping',
    ];
  }

  protected initSkeleton(channelSetId: string, bypassCache = false): void {
    if (this.isSkeletonProcessed) {
      return;
    }
    this.isSkeletonProcessed = true;

    (
      channelSetId
        ? this.store.dispatch(new GetSettings(channelSetId, GetSettings.bypassCache))
        : of({} as CheckoutSettingsInterface)
    ).subscribe((settings) => {

      // We have to call detectChanges() to make sure that <checkout-wrapper-skeleton-default-template> is visible
      // and we can take element by id
      this.cdr.detectChanges();
      const root = this.customElementService.shadowRoot
      ?? document;

      const existing = root.getElementById('pe-index-page-skeleton-content--default');
      const classList = this.params?.forceNoPaddings
        ? ['col-xs-12']
        : ['col-lg-6', 'col-lg-offset-3', 'col-md-8', 'col-md-offset-2', 'col-sm-10', 'col-sm-offset-1', 'col-xs-12'];

      timer(0).pipe(
        map(() => {
          const layoutAppBody = root.querySelector('.pe-skeleton-box');
          const headerBox = root.querySelector('.pe-header-box');

          if (!layoutAppBody) {
            throw layoutAppBody;
          }

          layoutAppBody.classList.add(...classList);
          headerBox.classList.add(...classList);

          return of();
        }),
        retryWhen(errors => errors.pipe(
            delay(300)
          )
        ),
      ).subscribe();

      const sanitizer: DomSanitizer = this.injector.get(DomSanitizer);
      this.skeleton$.next(sanitizer.bypassSecurityTrustHtml(existing.innerHTML));

      try {
        initMerchantSkeletonStyle(settings, this.env.backend.commerceos);
      } catch {
        // eslint-disable-next-line
        console.error('Not possible to load custom skeleton styles. Please add skeleton/loader.js file to scripts');
      }
      this.cdr.detectChanges();
    });
  }

  protected showError(error: string): void {
    if (!this.snackbarService) {
      this.loadSnackbarModule().then(() => this.showError(error));
    } else {
      this.snackbarService.toggle(true, error || 'Unknows error', {
        duration: 5000,
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }
  }

  protected initEventsHandler(): void {
    this.windowEventsService.message$(this.destroy$).subscribe((event: MessageEvent) => {
      if (event?.data?.event) {
        const key: string = event.data.event;
        const value: any = event.data.value;
        const events: string[] = Object.keys(CheckoutPluginEventEnum);
        if (events.indexOf(key) >= 0 && value && value.flowId === this.getFlowId()) {
          this.eventEmitted.emit(event.data);
        }
      }
    });
  }

  // We load it dynamically to decrease the main bundle size
  private loadSnackbarModule(): Promise<void> {
    return import('@pe/checkout/ui/snackbar')
      .then(({ SnackBarModule, SnackBarService }) => {
        const module = createNgModule(SnackBarModule, this.injector);
        this.snackbarService = module.injector.get(SnackBarService);
      });
  }
}
