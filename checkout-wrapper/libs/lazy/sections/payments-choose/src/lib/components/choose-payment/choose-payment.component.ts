import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Output,
  ViewChild,
  ViewContainerRef,
  OnInit,
  ComponentRef,
  TemplateRef,
  createNgModule,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Actions, Select, ofActionCompleted, ofActionDispatched } from '@ngxs/store';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  merge,
  of,
  throwError,
  from,
  iif,
  defer,
} from 'rxjs';
import {
  filter,
  map,
  shareReplay,
  take,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom,
  first,
  catchError,
  switchMap,
} from 'rxjs/operators';

import {
  RatesStateService,
  TrackingService,
} from '@pe/checkout/api';
import {
  AbstractWithFlowCloneComponent,
  HEADER_WITH_PADDING_HEIGHT,
  PANEL_HEIGHT,
  noRememberMe,
  PaymentMethodsService,
} from '@pe/checkout/core';
import { DialogConfigPresetName, DialogService } from '@pe/checkout/dialog';
import {
  AbstractChoosePaymentContainerInterface,
  NodeOptionsErrorService,
  PaymentVariantService,
} from '@pe/checkout/payment';
import { PluginEventsService } from '@pe/checkout/plugins';
import { FlowStorage } from '@pe/checkout/storage';
import {
  AuthSelectors,
  GetPaymentOptions,
  HideSteps,
  OpenNextStep,
  ParamsState,
  PatchFlow,
  PatchParams,
  ShowSteps,
  StepsState,
} from '@pe/checkout/store';
import {
  FlowInterface,
  PaymentMethodEnum,
  REMEMBER_ME_KEY,
  RateSummaryInterface,
  SectionType,
  ViewPaymentOption,
  PaymentMethodVariantEnum,
  AccordionPanelInterface,
} from '@pe/checkout/types';
import { CustomElementService, PAYMENT_TRANSLATIONS, PaymentHelperService } from '@pe/checkout/utils';
import { WindowSizesService } from '@pe/checkout/window';

import { CHOOSE_PAYMENT_CONFIG_MAP } from '../../constants';
import { DeviceDetectPaymentsService } from '../../services/device-payments.service';

import { DISABLE_CONTINUE_FOR_PAYMENTS, ENABLE_EXTRA_DURATION_SELECT } from './lazy-payments.config';

const PAYMENT_PANEL_HEIGHT = 66;

const INITIAL_PAYMENT_KEY = 'initialPayment';

const BillingAddressInsidePayment = [
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT,
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'section-choose-payment',
  styleUrls: ['./choose-payment.component.scss'],
  templateUrl: 'choose-payment.component.html',
})
export class ChoosePaymentComponent
  extends AbstractWithFlowCloneComponent
  implements OnInit {

  @Select(StepsState.steps) private steps$!: Observable<AccordionPanelInterface[]>;
  @Select(StepsState.allSteps) private allSteps$!: Observable<AccordionPanelInterface[]>;

  @Select(StepsState.nextStep) private nextStep$!: Observable<AccordionPanelInterface>;

  private readonly token = this.store.selectSnapshot(AuthSelectors.accessToken);

  private paymentContainerRefSubject$ = new BehaviorSubject<ViewContainerRef>(null);

  @ViewChild('paymentContainer', { read: ViewContainerRef }) set paymentContainerRef(containerRef: ViewContainerRef) {
    this.paymentContainerRefSubject$.next(containerRef);
  }

  @ViewChild('tooltipRef') private tooltipRef: TemplateRef<any>;

  @Output() globalLoading = new EventEmitter<boolean>();

  isFlowFinished = false;
  isChangeDisabled = false;
  // isLoading and isRatesLoading and isRatesError are fired by child modules.
  isLoading = false;
  isChangeOptionLoading = false;
  isRatesLoading = false;
  isFormOptionsLoading = false;
  isRatesError = false;
  // isSwitching is used only during switching methods
  isSwitching = false;
  isUpdatingList = false;
  isPaymentReady = false;
  isPaymentModalShown = false;
  paymentOptions: ViewPaymentOption[] = [];
  paymentOptionLastClicked: ViewPaymentOption = null;
  rememberMe = false;
  textContinue: string = null;
  hiddenContinue = false;
  isFullWidth = false;
  helpText: string = null;

  submit$: Subject<boolean> = new Subject();

  agreementLink$: Observable<string> = null;
  isMobile$: Observable<boolean> = null;
  embeddedMode$: Observable<boolean> = null;
  showOtherPayment$: Observable<boolean> = null;
  isHiddenContinueBlock$ = new BehaviorSubject<boolean>(false);

  isPaymentNext: boolean;

  readonly paymentTranslations = PAYMENT_TRANSLATIONS;
  readonly PaymentMethodEnum = PaymentMethodEnum;

  private paymentOptionSubject$ = new BehaviorSubject<ViewPaymentOption>(null);
  paymentOption$ = this.paymentOptionSubject$.pipe(
    filter(value => !!value),
    shareReplay(1),
  );

  get paymentOption() {
    return this.paymentOptionSubject$.getValue();
  }

  private isContinueDisabledSubject$ = new BehaviorSubject<boolean>(true);
  isContinueDisabled$: Observable<boolean>;

  private submitActionSubject$ = new Subject<void>();
  private continueFlowSubject$ = new Subject<void>();
  isShowRememberMe$: Observable<boolean>;
  isStripeWallet$: Observable<boolean>;

  tooltipConfig = {
    tooltipMessage: $localize`:@@payment.tooltip.remember_me:`,
    rootCssClass: 'pe-checkout-bootstrap',
  };

  translations = {
    rememberMe: $localize`:@@payment.form.label.remember_me:`,
  };

  constructor(
    injector: Injector,
    protected customElementService: CustomElementService,
    private changeDetectorRef: ChangeDetectorRef,
    private flowStorage: FlowStorage,
    private pluginEventsService: PluginEventsService,
    private paymentHelperService: PaymentHelperService,
    private trackingService: TrackingService,
    private peWindowService: WindowSizesService,
    private deviceDetectPaymentsService: DeviceDetectPaymentsService,
    private ratesStateService: RatesStateService,
    private paymentVariantService: PaymentVariantService,
    private nodeOptionsErrorService: NodeOptionsErrorService,
    private paymentMethodsService: PaymentMethodsService,
    private dialogService: DialogService,
    private actions$: Actions,
  ) {
    super(injector);
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['alert-32', 'help-24'],
      null,
      this.customElementService.shadowRoot,
    );
  }

  initFlow(): void {
    super.initFlow();
    this.agreementLink$ = this.flow$.pipe(
      map(() => {
        const linkText: string = $localize`:@@payment.agreement_link:`;
        const linkHref: string = $localize`:@@payment.agreement_href:`;

        // In past it was flow.accept_terms_payever
        return `<a href='${linkHref}' target='_blank' class='text-secondary'><u>${linkText}</u></a>`;
      }),
    );
    this.embeddedMode$ = this.pickParam$(this.destroy$, d => d.embeddedMode);

    this.showOtherPayment$ = this.pickParam$(this.destroy$, d => d.showOtherPayment);

    this.flow$.pipe(
      tap(() => this.setUpdatingList(true)),
      switchMap(flow =>
        this.paymentMethodsService.getViewPaymentOptions(flow).pipe(
          filter(options => !!options),
          tap(((options) => {
              const allowedPaymentOptions = options.filter(
                payment => this.deviceDetectPaymentsService.allowDevice(payment.paymentMethod),
              );
              this.setUpdatingList(false);
              const isPaymentOptionsEqual = this.paymentOptions.length === allowedPaymentOptions.length
                && this.paymentOptions.every((paymentOption, index) => {
                  const correspondingOption = allowedPaymentOptions[index];

                  return correspondingOption
                    && paymentOption.paymentMethod === correspondingOption.paymentMethod;
                });

              if (!isPaymentOptionsEqual) {
                this.paymentOptions = allowedPaymentOptions;
                this.setInitialPayment(flow, allowedPaymentOptions);
              } else if (this.paymentOptions?.length === 0) {
                this.globalLoading.emit(false);
              }
            }),
          ),
        )),
      takeUntil(this.destroy$),
    ).subscribe();

    this.isMobile$ = this.peWindowService.isMobile$.pipe(takeUntil(this.destroy$));
  }

  // We use ngAfterViewInit instead of ngOnInit because have many detectChanges() calls
  ngOnInit(): void {
    super.ngOnInit();

    const isPaymentLoading$ = this.paymentHelperService.isLoading$.pipe(
      tap((isLoading) => {
        this.setLoading(isLoading);
      }),
    );

    this.isContinueDisabled$ = combineLatest([
      this.isContinueDisabledSubject$,
      isPaymentLoading$,
    ]).pipe(
      withLatestFrom(this.params$, this.settings$),
      map(([[value], { setDemo }, { testingMode }]) => !this.paymentOption
        || value
        || !this.paymentOptions?.length
        || this.isLoading
        || this.isUpdatingList
        || setDemo
        || testingMode,
      ),
      shareReplay(1),
      tap(() => this.cdr.markForCheck()),
    );

    this.isShowRememberMe$ = this.paymentOption$.pipe(
      withLatestFrom(this.settings$),
      map(([paymentOption, settings]) => !this.token
        && paymentOption
        && settings?.enableCustomerAccount
        && noRememberMe.indexOf(paymentOption.paymentMethod) < 0,
      ),
    );

    this.isStripeWallet$ = this.paymentOption$.pipe(
      filter(payment => !!payment),
      map(({ paymentMethod }) =>
        (paymentMethod === PaymentMethodEnum.APPLE_PAY
          || paymentMethod === PaymentMethodEnum.GOOGLE_PAY)
        && this.deviceDetectPaymentsService.allowDevice(paymentMethod),
      ),
    );

    // Todo remove next lines when all payments are micro:

    const changePanel$ = this.nextStep$.pipe(
      filter(d => !!d),
      map(step => step.name === SectionType.Payment),
      tap(value => this.isPaymentNext = value),
    );

    const continueFlow$ = this.continueFlowSubject$.pipe(
      withLatestFrom(this.isContinueDisabled$),
      filter(([_, isDisabled]) => !isDisabled),
      tap(() => this.onPaymentModuleNavigate()),
    );

    const submitAction$ = this.submitActionSubject$.pipe(
      withLatestFrom(this.isContinueDisabled$, this.paymentOption$),
      filter(([_, isContinueDisabled, paymentOption]) => !isContinueDisabled
        && !this.isLoading
        && !!paymentOption,
      ),
      throttleTime(500),
      tap(() => this.submit()),
    );

    const paymentOptionsLoading$ = merge(
      this.actions$.pipe(
        ofActionDispatched(GetPaymentOptions),
        map(() => true),
      ),
      this.actions$.pipe(
        ofActionCompleted(GetPaymentOptions),
        map(() => false),
      ),
    ).pipe(
      tap(value => this.paymentHelperService.setPaymentLoading(value)),
    );

    merge(
      changePanel$,
      continueFlow$,
      submitAction$,
      paymentOptionsLoading$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  isSelected(paymentOption: ViewPaymentOption): boolean {
    return this.paymentOption && paymentOption.id === this.paymentOption.id;
  }

  isSelectedShown(paymentOption: ViewPaymentOption): boolean {
    return this.paymentOptionLastClicked && paymentOption.id === this.paymentOptionLastClicked.id;
  }

  onChangePaymentOption(paymentOption: ViewPaymentOption): void {
    this.textContinue = null;
    this.hiddenContinue = false;
    this.isFullWidth = false;
    this.isRatesError = null;
    this.isPaymentReady = false;
    this.isPaymentModalShown = false;
    this.paymentOptionLastClicked = paymentOption;

    this.isSwitching = true;
    this.isContinueDisabledSubject$.next(true);
    this.isChangeDisabled = true;
    this.isChangeOptionLoading = true;
    this.paymentOptionSubject$.next(null);
    this.changeTotalAmount(null);
    this.changeDownPayment(null);
    this.toggleBillingAddressStep(paymentOption.paymentMethod);

    this.changeDetectorRef.detectChanges();
    this.paymentContainerRefSubject$.getValue()?.clear();

    this.activatePaymentOption(this.flow, paymentOption).pipe(
      map(() => null),
      catchError(err => of(err)),
      tap(() => {
        this.paymentOptionSubject$.next({ ...paymentOption, settings: { ...paymentOption.settings } });
        this.isHiddenContinueBlock$.next(this.isHiddenContinueBlock(paymentOption.paymentMethod));
        this.isSwitching = false;
        this.isChangeDisabled = false;
        this.changeDetectorRef.detectChanges();
      }),
      switchMap(error => this.paymentContainerRefSubject$.pipe(
        filter(d => !!d),
        take(1),
        switchMap((paymentContainerRef) => {
          paymentContainerRef.clear();

          return iif(
            () => error,
            defer(() => this.nodeOptionsErrorService.handleError(error, paymentContainerRef).pipe(
              tap(() => {
                this.onChangePaymentOption(paymentOption);
              }),
            )),
            this.loadPayment(
              paymentOption.paymentMethod,
              paymentOption.version,
              paymentContainerRef,
            ).pipe(
              catchError(err => this.paymentVariantService.handleError(err, paymentContainerRef).pipe(
                tap(() => {
                  this.onChangePaymentOption(paymentOption);
                }),
              )),
            ),
          );
        }),
      )),
      tap(() => {
        this.isChangeOptionLoading = false;
        this.isContinueDisabledSubject$.next(false);
      }),
      take(1),
    ).subscribe();
  }

  onChangeRememberMe(event: MatCheckboxChange): void {
    this.rememberMe = event.checked;
    combineLatest([
      this.flow$,
      this.isShowRememberMe$,
    ]).pipe(
      tap(([flow, isShowRememberMe]) => {
        if (isShowRememberMe) {
          this.flowStorage.setData(flow.id, REMEMBER_ME_KEY, this.rememberMe);
        } else {
          this.flowStorage.clearData(flow.id, REMEMBER_ME_KEY);
        }
      }),
      take(1),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onChangeTextContinue(textContinue: string): void {
    this.textContinue = this.isPaymentNext
      ? textContinue
      : $localize`:@@action.continue:`;
    this.changeDetectorRef.detectChanges();
  }

  onChangeHiddenContinue(hiddenContinue: boolean): void {
    this.hiddenContinue = hiddenContinue;
    this.changeDetectorRef.detectChanges();
  }

  onChangeFullWidth(fullWidth: boolean): void {
    this.isFullWidth = fullWidth;
    this.changeDetectorRef.detectChanges();
  }

  onPaymentModuleLoaded(status: boolean): void {
    if (!status) {
      this.isContinueDisabledSubject$.next(status);
    }

    if (status) {
      setTimeout(() => {
        this.globalLoading.emit(false);
      }, 10);
      this.trackingService.doEmitPaymentMethodLoaded(this.flowId, this.paymentOption?.paymentMethod);
    }

    this.isChangeDisabled = !status;
    this.changeDetectorRef.detectChanges();
  }

  onPaymentModuleRatesLoading(isLoading: boolean): void {
    this.setRatesLoading(isLoading);
  }

  onPaymentModuleFormOptionsLoading(isLoading: boolean): void {
    this.isFormOptionsLoading = isLoading;
    this.changeDetectorRef.detectChanges();
  }

  onPaymentModuleRateSelected(rateSummary: RateSummaryInterface): void {
    this.isContinueDisabledSubject$.next(!rateSummary);

    this.changeTotalAmount(rateSummary ? rateSummary.totalAmount : null);
    this.changeDownPayment(rateSummary ? rateSummary.downPayment : null);
    if (rateSummary?.chooseText) {
      this.textContinue = rateSummary.chooseText;
    }
  }

  onPaymentModuleNavigate(): void {
    this.params$.pipe(
      first(),
      withLatestFrom(this.settings$),
      tap(([{ setDemo }, { testingMode }]) => {
        if (!setDemo && !testingMode) {
          (window as any).paymentOptionToSelectOnInit = null;
          this.setLoading(true);
          this.store.dispatch(new PatchParams({ forceChoosePaymentOnlyAndSubmit: false }));

          this.store.dispatch(new OpenNextStep());
        }
      }),
    ).subscribe();
  }

  onPaymentModuleValid(status: boolean): void {
    this.params$.pipe(
      first(),
      tap(({ forceChoosePaymentOnlyAndSubmit }) => {
        // When payment micro emits service ready
        this.isContinueDisabledSubject$.next(!status);
        this.isPaymentReady = !!status;

        if (status) { // For Invoice DE as lib
          this.onPaymentModuleLoaded(true);
        }

        if (forceChoosePaymentOnlyAndSubmit && status) {
          this.onSubmit();
        }
      }),
    ).subscribe();
  }

  private submit(): void {
    this.submit$.next();
  }

  onSubmit(): void {
    this.submitActionSubject$.next();
  }

  setLoading(isLoading: boolean): void {
    if (isLoading !== this.isLoading) {
      this.isLoading = isLoading;
      this.changeDetectorRef.detectChanges();
    }
  }

  setUpdatingList(isUpdatingList: boolean): void {
    if (isUpdatingList !== this.isUpdatingList) {
      this.isUpdatingList = isUpdatingList;
      this.changeDetectorRef.detectChanges();
    }
  }

  setRatesLoading(isLoading: boolean): void {
    this.isRatesLoading = isLoading;
    this.changeDetectorRef.detectChanges();
  }

  setRatesError(isError: boolean): void {
    this.isRatesError = isError;
    this.changeDetectorRef.detectChanges();
  }

  activatePaymentOption(flow: FlowInterface, paymentOption: ViewPaymentOption): Observable<FlowInterface> {
    return iif(
      () => paymentOption.id !== flow.connectionId,
      this.store.dispatch(new PatchFlow({ connectionId: paymentOption.id })).pipe(
        map(({ checkout: { flow } }) => flow),
      ),
      of(flow),
    ).pipe(
      tap(() => {
        this.scrollToSelected(paymentOption.paymentMethod);
      }),
    );
  }

  protected scrollToSelected(paymentMethod: PaymentMethodEnum, offset = 0): void {
    if (paymentMethod) {
      let step = 0;
      this.steps$.pipe(
        take(1),
        tap((panels) => {
          step = panels.findIndex(panel => !!panel.step);
        }),
      ).subscribe();

      const index = this.paymentOptions.findIndex(option => option.paymentMethod === paymentMethod);
      this.pluginEventsService.emitPanelOpened(
        this.flowId,
        HEADER_WITH_PADDING_HEIGHT + (step + 1) * PANEL_HEIGHT + index * PAYMENT_PANEL_HEIGHT + offset,
      );
    }
  }

  isExtraDurationsSelect(paymentMethod: PaymentMethodEnum): boolean {
    return this.isMerchantMode() && ENABLE_EXTRA_DURATION_SELECT.includes(paymentMethod);
  }

  private isMerchantMode(): boolean {
    const params = this.store.selectSnapshot(ParamsState.params);

    return !!params.merchantMode && !!params.embeddedMode;
  }

  continueFlow(): void {
    this.continueFlowSubject$.next();
  }

  public tooltipClick(): void {
    this.dialogService.open(this.tooltipRef, DialogConfigPresetName.Small, {
      text: $localize`:@@payment.tooltip.remember_me:`,
    });
  }

  private isHiddenContinueBlock(paymentMethod: PaymentMethodEnum): boolean {
    return this.isMerchantMode() && DISABLE_CONTINUE_FOR_PAYMENTS.includes(paymentMethod);
  }

  private loadPayment(
    paymentMethod: PaymentMethodEnum,
    variantType: PaymentMethodVariantEnum,
    paymentContainerRef: ViewContainerRef,
  ): Observable<AbstractChoosePaymentContainerInterface> {
    let componentRef: ComponentRef<AbstractChoosePaymentContainerInterface>;
    const variant = variantType ?? PaymentMethodVariantEnum.Default;

    if (CHOOSE_PAYMENT_CONFIG_MAP[paymentMethod][variant]) {
      return from(
        CHOOSE_PAYMENT_CONFIG_MAP[paymentMethod][variant].import()
          .then((module) => {
            if (componentRef) {
              componentRef.destroy();
            }

            const factory = createNgModule(module, this.injector);
            const componentType = factory.instance.resolveChoosePaymentStepContainerComponent();
            componentRef = paymentContainerRef.createComponent(componentType, {
              injector: factory.injector,
            });

            const instance = componentRef.instance;
            const destroy$ = new Subject<void>();
            componentRef.onDestroy(() => destroy$.next());

            this.ratesStateService.enableDurationsSelectForMerchant$.next(this.isExtraDurationsSelect(paymentMethod));

            merge(
              this.submit$.pipe(
                tap(() => instance.triggerSubmit()),
              ),
              instance.buttonText.pipe(tap((e: any) => this.onChangeTextContinue(e))),
              instance.continue.pipe(tap(() => this.continueFlow())),
              instance.selectRate?.pipe(tap((e: any) => this.onPaymentModuleRateSelected(e))) || [],
              instance.buttonHidden?.pipe(tap((e: any) => this.onChangeHiddenContinue(e))) || [],
              instance.fullWidthMode?.pipe(tap((e: any) => this.onChangeFullWidth(e))) || [],
              instance.serviceReady?.pipe(tap((e: any) => this.onPaymentModuleValid(e))) || [],
              instance.ratesLoading?.pipe(tap((e: any) => this.onPaymentModuleRatesLoading(e))) || [],
              instance.loading?.pipe(tap((e: boolean) => this.setLoading(e))) || [],
            ).pipe(
              tap(() => {
                instance.cdr?.markForCheck();
                componentRef.changeDetectorRef.markForCheck();
                this.cdr.markForCheck();
              }),
              takeUntil(destroy$),
            ).subscribe();

            this.onPaymentModuleValid(true);
            paymentContainerRef.insert(componentRef.hostView);

            return instance;
          }),
      );
    }

    this.onPaymentModuleValid(true);

    return throwError(new Error(`Invalid config, ${paymentMethod}:${variantType}`));
  }

  private changeTotalAmount(totalAmount: number): void {
    this.paymentHelperService.totalAmount$.next(totalAmount);
  }

  private changeDownPayment(downPayment: number): void {
    this.paymentHelperService.downPayment$.next(downPayment);
  }

  paymentLoaded(value: boolean): void {
    this.onPaymentModuleValid(value);
  }

  private setInitialPayment(flow: FlowInterface, options: ViewPaymentOption[]): void {
    // When we change address or amount list can be changed
    //  and selected option can disappear. In this case select first one
    const paymentOption = (options || []).find(option => option.id === flow.connectionId)
      || options[0];

    if (paymentOption) {
      const initialPayment = this.flowStorage.getData<ViewPaymentOption>(flow.id, INITIAL_PAYMENT_KEY);
      const hasPayment = initialPayment && !!this.paymentOptions.find(o => o.id === initialPayment.id);

      // We need firstInit to prevent wrong behaviour on flow cloning
      this.onChangePaymentOption(hasPayment
        ? initialPayment
        : paymentOption,
      );
      this.flowStorage.clearData(flow.id, INITIAL_PAYMENT_KEY);
    } else {
      this.globalLoading.emit(false);
    }
  }

  private toggleBillingAddressStep(
    paymentMethod: PaymentMethodEnum,
  ): void {
    if (paymentMethod) {
      this.allSteps$.pipe(
        take(1),
        tap((panels) => {
          const stepName = SectionType.Address;
          const stepIndexes = this.getStepIndexes(
            panels,
            [SectionType.ChoosePayment, stepName, SectionType.Payment]
          );
          const excludedIntegrations = this.store.selectSnapshot(StepsState.getExcludedIntegrations)(stepName);
          const skipForInside = BillingAddressInsidePayment.includes(paymentMethod) &&
            stepIndexes[SectionType.ChoosePayment] < stepIndexes[stepName] &&
            stepIndexes[stepName] < stepIndexes[SectionType.Payment];

          const skipForWallet = stepIndexes[SectionType.ChoosePayment] < stepIndexes[stepName] &&
            excludedIntegrations.includes(paymentMethod);


          skipForInside || skipForWallet
            ? this.store.dispatch(new HideSteps([stepName]))
            : this.store.dispatch(new ShowSteps([stepName]));
        }),
      ).subscribe();
    }
  }

  private getStepIndexes(
    panels: AccordionPanelInterface[],
    stepNames: SectionType[]
  ): Record<SectionType, number> {
    const stepIndexes = panels.reduce((acc, step, index) => {
      if (stepNames.includes(step.name)) {
        return {
          ...acc,
          [step.name]: index,
        };
      }

      return acc;
    }, {}) as Record<SectionType, number>;

    return stepIndexes;
  }
}
