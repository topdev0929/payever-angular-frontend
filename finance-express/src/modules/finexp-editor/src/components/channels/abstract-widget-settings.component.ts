import { ElementRef, Injector, ViewChild, Directive, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { cloneDeep, forEach } from 'lodash-es';
import { combineLatest, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, debounceTime, filter, map, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PE_ENV } from '@pe/common';
import { PePlatformHeaderItem } from '@pe/platform-header';
import { EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import {
  WidgetTypeEnum,
  PaymentWidgetEnum,
  PaymentMethodEnum,
  WidgetConfigInterface,
  CustomWidgetConfigInterface,
  WidgetConfigPaymentInterface
} from '@pe/checkout-types';
import { TranslateService } from '@pe/i18n';

import { AbstractComponent } from '../abstract.component';
import { GenerateHtmlService, FinexpHeaderAbstractService } from '../../services';
import {
  SantanderDkProductInterface,
  CheckoutChannelSetInterface,
  widgetCreatedEventMessage,
  swedenTokenErrorEventMessage,
  paymentOptionsNotSetEventMessage,
  cannotGetCalculationsEventMessage,
  PaymentsViewInterface,
  PaymentOptionsInterface,
  DefaultConnectionInterface
} from '../../interfaces';
import { FinexpApiAbstractService } from '../../services';
import { FinexpStorageAbstractService } from '../../services';
import { PayeverPaymentWidgetLoader } from '../../../../finexp-widget/pe-finexp-widget';
import { defaultCustomWidgetConfig } from '../../../../finexp-widget/constants';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractWidgetSettingsComponent extends AbstractComponent {

  @ViewChild('preview', { static: true }) previewElement: ElementRef;

  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected apiService: FinexpApiAbstractService = this.injector.get(FinexpApiAbstractService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected formBuilder: FormBuilder = this.injector.get(FormBuilder);
  protected router: Router = this.injector.get(Router);
  protected generateHtmlService: GenerateHtmlService = this.injector.get(GenerateHtmlService);
  protected _clipboardService: ClipboardService = this.injector.get(ClipboardService);
  protected env: EnvInterface = this.injector.get(PE_ENV);
  public storageService: FinexpStorageAbstractService = this.injector.get(FinexpStorageAbstractService);
  public translationService: TranslateService = this.injector.get(TranslateService);

  protected readonly saveRequestDebounceTime: number = 500;
  protected readonly spinnerDiameter: number = 26;
  protected readonly spinnerWidth: number = 2;
  protected readonly minWidthLimit: number = 300;

  protected readonly BNPLMethods = [
    // PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
    PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
    PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
  ];

  protected headerService: FinexpHeaderAbstractService = this.injector.get(FinexpHeaderAbstractService);

  protected widgetLoader = new PayeverPaymentWidgetLoader();

  allowSettingsManualScroll: boolean = true;
  channelSetId: string;
  errorMessage: string;
  form: FormGroup;
  generatedHtml: string;
  isGeneratedCode = false;
  isVisibility: boolean;
  showSpinner: boolean = false;
  channelSetType: WidgetTypeEnum;

  diameter: number = 32;
  strokeWidth: number = 2;

  isLoadingPayments: boolean = false;
  connectedPayments: PaymentsViewInterface[] = [];

  paymentsOptions: PaymentOptionsInterface[] = [];

  defaultWidgetConfig: WidgetConfigInterface = defaultCustomWidgetConfig;

  widgetConfig: CustomWidgetConfigInterface;
  widgetStyles: string = JSON.stringify(this.defaultWidgetConfig.styles);
  widgetAmount: number = 2500;
  widgetPayments: string;

  constructor(protected injector: Injector) {
    super();
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid'] || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  get widgetId(): WidgetTypeEnum {
    return this.activatedRoute.snapshot.params['widgetId'] || this.activatedRoute.parent.snapshot.params['widgetId'] as WidgetTypeEnum;
  }

  ngOnInit(): void {
    this.showSpinner = true;

    this.subscribeToWidgetMessages();

    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).pipe(
      switchMap(() => {
        return this.apiService.getChannelSets(this.storageService.businessUuid).pipe(
          map((chanelSets: CheckoutChannelSetInterface[]) =>
            chanelSets.filter(channelSet => channelSet.checkout === this.checkoutUuid)
          )
        );
      }),
      switchMap((channelSets: CheckoutChannelSetInterface[]) => {
        if (!!channelSets && channelSets.length > 0) {
          const channelSet: CheckoutChannelSetInterface = channelSets
            .find((channel: CheckoutChannelSetInterface) => channel.type === 'finance_express');

          if (!channelSet) {
            return throwError('finexp.channels.errors.channelSetNotFound');
          }
          return this.generateHtmlService.generateEmbedCode(this.widgetId, this.checkoutUuid, this.widgetAmount, this.channelSetType).pipe(
            switchMap(code => {
              this.generatedHtml = code;
              return this.apiService.getWidgetSettingsById(this.storageService.businessUuid, this.checkoutUuid, this.widgetId);
            })
          );
        } else {
          return throwError('finexp.channels.errors.channelSetNotFound');
        }
      }),
      catchError(() => {
        return of(null);
      })
    ).subscribe(
      (response: CustomWidgetConfigInterface) => {
        if (response) {
          response.widgetId = this.widgetId;
          this.initWidgetConfig(response);
          this.createForm(response);
          this.showSpinner = false;
          this.channelSetType = response.type;
          this.addWidgetToPage(response);
          this.subscribeToFormUpdate();
        } else {
          this.createForm(null);
          // save default settings to server after first open of settings, because user can use widget right after that
          this.showSpinner = false;
          this.cdr.detectChanges();
        }

      },
      (err) => {
        this.storageService.showError(err);
        this.createForm(null);
        this.showSpinner = false;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.widgetLoader.unsubscribeChangeDetectionSub();
  }

  initWidgetConfig(config: CustomWidgetConfigInterface): void {
    this.widgetConfig = config;

    // filter old SANTANDER_INSTALLMENT_DK payments without productId
    this.widgetConfig.payments = this.widgetConfig.payments.filter(payment => {
      return payment.paymentMethod !== PaymentMethodEnum.SANTANDER_INSTALLMENT_DK
        || payment.productId;
    });

    this.widgetStyles = JSON.stringify(this.widgetConfig.styles);
    this.widgetPayments = JSON.stringify(config.payments);
    this.channelSetId = config.channelSet;
    this.storageService.getBusiness().pipe(
      takeUntil(this.destroyed$),
      filter(a => !!a),
      switchMap(business => this.storageService.getPaymentOptions(business.currency)),
      filter(a => !!a),
      tap(options => {
        this.paymentsOptions = options || [];
        this.setWidgetAmount(this.widgetConfig.payments);
      }),
      switchMap(() => this.initPayments()),
      tap(()=>{
        this.widgetConfig.payments = this.widgetConfig.payments.filter(payment => 
          this.connectedPayments.some(cp => cp.paymentMethod === payment.paymentMethod)
        );
      })
    ).subscribe();
  }

  onCOpyCodeClicked(): void {
    this._clipboardService.copyFromContent(this.generatedHtml);
  }

  getGenerateHtmlButton(): PePlatformHeaderItem {
    return {
      title: 'finexp.channels.generateHtml.getCode',
      isActive: this.isGeneratedCode,
      onClick: () => this.setIsGeneratedCode(),
    };
  }

  setIsGeneratedCode(): void {
    this.isGeneratedCode = !this.isGeneratedCode;
  }

  goBack(): void {
    this.router.navigate([this.storageService.getHomeChannelsUrl(this.checkoutUuid)]);
  }

  saveSettings(): Observable<WidgetConfigInterface> {
    const newData: WidgetConfigInterface = this.getUpdatedSettings();
    delete newData.channelSet;
    delete newData._id;
    newData.checkoutId = this.checkoutUuid;
    return forkJoin(newData.payments.map((payment: WidgetConfigPaymentInterface) => {
      return this.apiService.getDefaultConnection(this.channelSetId, payment.paymentMethod).pipe(
        map((connection: DefaultConnectionInterface) => {
          return {
            ...payment,
            connectionId: connection._id,
          };
        }),
      );
    })).pipe(
      switchMap((newPayments: WidgetConfigPaymentInterface[]) => {
        newData.payments = newPayments;
        return this.apiService.saveWidgetSettings(this.storageService.businessUuid, this.widgetConfig._id, newData);
      }),
      catchError((err) => {
        this.storageService.showError(this.translationService.translate('finexp.channels.errors.cannotSaveSettings'));

        return of(err);
      })
    );
  }

  setFormValue(fieldName: string, value: any): void {
    this.form.controls[fieldName].patchValue(value);
  }

  /**
   * If input text field has focus then we cannot scroll settings by finger
   * @param isFocus
   */
  setInputFocus(isFocus: boolean): void {
    this.allowSettingsManualScroll = !isFocus;
  }

  setWidgetAmount(payments: WidgetConfigPaymentInterface[]): void {
    this.widgetAmount = payments.length && payments[payments.length - 1]
      ? (payments[payments.length - 1].amountLimits.min + payments[payments.length - 1].amountLimits.max) / 2
      : 2500;
    this.updateGeneratedCode();
  }

  updateGeneratedCode() {
    this.generateHtmlService.generateEmbedCode(this.widgetId, this.checkoutUuid, this.widgetAmount, this.channelSetType)
      .subscribe((code) => this.generatedHtml = code);
  }

  subscribeToFormUpdate(): void {

    this.form.valueChanges.pipe(
      takeUntil(this.destroyed$),
      tap(() => {
        this.updateWidgetSettings();
      }),
      skip(1),
      debounceTime(this.saveRequestDebounceTime)
    )
      .subscribe(() => {
        this.validateLimits();
        if (this.form.valid) {
          this.saveSettings().subscribe();
        }
      });

    this.form.updateValueAndValidity();
  }

  validateLimits(): void {
    if (!this.widgetConfig?.payments.length) {
      this.errorMessage = this.translationService.translate('finexp.channels.errors.noPaymentSelected');
    } else if (this.isPaymentsHaveLimitsBreaks()) {
      this.errorMessage = this.translationService.translate('finexp.channels.errors.breaksBetweenPaymentLimits');
    } else {
      this.errorMessage = null;
    }
    this.cdr.detectChanges();
  }

  private addWidgetToPage(config: CustomWidgetConfigInterface): void {
    // if it deployed on exclusive test env, env.frontend.commerceos url returns CORS error
    // so we use local env

    this.widgetLoader.init(
      '.payever-finexp-widget',
      this.env,
      {
        ...config,
        reference: ''
      }
    );
  }

  private initPayments() {
    this.isLoadingPayments = true;
    let dkProducts: SantanderDkProductInterface[] = null;
    let availablePaymentMethods: PaymentsViewInterface[] = [];

    return combineLatest([
      this.storageService.getIntegrationsInfoOnce(false),
      this.storageService.getInstalledCheckoutConnections(this.checkoutUuid, false).pipe(filter(a => !!a), take(1)),
    ])
      .pipe(
        map(data => {
          const integrations = data[0];
          const installedList = data[1];

          return integrations.filter(integration => {
            return integration.installed
              && integration.enabled
              && installedList.map(a => a.integration).indexOf(integration.integration.name) >= 0
              && Object.values(PaymentWidgetEnum).some(method => method === integration.integration.name);
          });
        }),
        switchMap((payments) => {
          let isDKpayment = false;
          availablePaymentMethods = payments.map(payment => {
            const paymentOptions = this.paymentsOptions.find(options => options.payment_method === payment.integration.name);
            isDKpayment = payment.integration.name === PaymentMethodEnum.SANTANDER_INSTALLMENT_DK;

            return {
              paymentMethod: payment.integration.name,
              validationLimits: {
                min: paymentOptions?.min,
                max: paymentOptions?.max,
              },
              isBNPL: false,
              name: payment.integration.displayOptions.title,
              icon: payment.integration.displayOptions.icon,
              selected: false,
            } as PaymentsViewInterface;
          });

          return isDKpayment
            ? this.storageService.getSantanderDkProductsEx(this.channelSetId, false).pipe(catchError(e => of([]))).pipe(
              tap((data) => dkProducts = data),
              map(() => payments)
            )
            : of(payments);
        }),
        tap(()=>{
          this.connectedPayments = availablePaymentMethods.reduce((acc: PaymentsViewInterface[], curr: PaymentsViewInterface) => {

            const defaultSelectedMethod = this.widgetConfig.payments.find(configPayment => {
              return configPayment.paymentMethod === curr.paymentMethod && !configPayment.isBNPL && !configPayment.productId;
            });
  
            curr.selected = !!defaultSelectedMethod;
            curr.amountLimits = defaultSelectedMethod ? defaultSelectedMethod.amountLimits : curr.validationLimits;
  
            const defaultTitleKey = `finexp.channels.payments.${curr.paymentMethod}.default`;
            curr.name = this.translationService.hasTranslation(defaultTitleKey) ?
              this.translationService.translate(defaultTitleKey) :
              curr.name;
  
            if (curr.paymentMethod === PaymentMethodEnum.SANTANDER_INSTALLMENT_DK) {
              forEach(dkProducts, (dkProduct: SantanderDkProductInterface) => {
                const customMethod = cloneDeep(curr);
  
                customMethod.name = dkProduct.name;
                customMethod.isBNPL = !!dkProduct.paymentFreePeriod.payLaterType;
                customMethod.validationLimits = {
                  min: Math.max(customMethod.validationLimits.min, dkProduct?.minAmount),
                  max: Math.min(customMethod.validationLimits.max, dkProduct?.maxAmount)
                };
                customMethod.productId = String(dkProduct.id);
  
                const selectedCustomMethod = this.widgetConfig.payments.find(item => {
                  return item.paymentMethod === customMethod.paymentMethod && String(item.productId || null) === String(dkProduct.id || null);
                });
                customMethod.amountLimits = selectedCustomMethod ? selectedCustomMethod.amountLimits : customMethod.validationLimits;
                customMethod.selected = !!selectedCustomMethod;
  
                acc = [...acc, customMethod];
              });
            } else if (this.BNPLMethods.includes(curr.paymentMethod)) {
              const bnplMethod = cloneDeep(curr);
              const customTitleKey = `finexp.channels.payments.${curr.paymentMethod}.bnpl`;
              bnplMethod.name = this.translationService.hasTranslation(customTitleKey) ?
                this.translationService.translate(customTitleKey) :
                `${bnplMethod.name} / ${this.translationService.translate('finexp.channels.payments.bnpl')}`;
              bnplMethod.isBNPL = true;
  
              const selectedBNPLMethod = this.widgetConfig.payments.find(item => {
                return item.paymentMethod === bnplMethod.paymentMethod && item.isBNPL;
              });
              bnplMethod.selected = !!selectedBNPLMethod;
  
              bnplMethod.amountLimits = selectedBNPLMethod ? selectedBNPLMethod.amountLimits : bnplMethod.amountLimits;
              acc = [...acc, curr];
              acc = [...acc, bnplMethod];
            } else {
              acc = [...acc, curr];
            }
            return acc;
          }, []);
          this.validateLimits();
          this.isLoadingPayments = false;
        })
      );
  }

  private subscribeToWidgetMessages(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === location.origin && event.source === window) {
        const data: any = event.data;

        switch (data) {
          case widgetCreatedEventMessage:
            this.showSpinner = false;
            this.cdr.detectChanges();
            break;
          case paymentOptionsNotSetEventMessage:
            this.showSpinner = false;
            this.errorMessage = 'finexp.channels.errors.paymentOptionNotSet';
            this.cdr.detectChanges();
            break;
          case cannotGetCalculationsEventMessage:
            this.showSpinner = false;
            this.errorMessage = 'finexp.channels.errors.cannotGetCalculation';
            this.cdr.detectChanges();
            break;
          case swedenTokenErrorEventMessage:
            this.showSpinner = false;
            this.errorMessage = 'finexp.channels.errors.cannotFetchTokenForSe';
            this.cdr.detectChanges();
            break;
        }
      }
    });
  }

  private isPaymentsHaveLimitsBreaks(): boolean {
    if (this.widgetConfig?.payments.length < 2) {
      return false;
    }
    return !this.widgetConfig.payments
      .every((payment, index, array) => {
        return array
          .filter(item => {
            return item.paymentMethod !== payment.paymentMethod || item.isBNPL !== payment.isBNPL
              || (item.paymentMethod === PaymentMethodEnum.SANTANDER_INSTALLMENT_DK && item.productId !== payment.productId);
          })
          .some(item => item.amountLimits.max >= payment.amountLimits.min && item.amountLimits.min <= payment.amountLimits.max);
      });
  }

  protected getPaymentPaymentFromPaymentsArray(
    payment: PaymentsViewInterface,
    paymentsArray: PaymentsViewInterface[] = this.widgetConfig?.payments || []
  ) {
    if (payment.paymentMethod === PaymentMethodEnum.SANTANDER_INSTALLMENT_DK) {
      return paymentsArray.find(item => {
        return item.paymentMethod === payment.paymentMethod
          && item.isBNPL === payment.isBNPL
          && String(item.productId || null) === String(payment.productId || null);
      });
    } else {
      return paymentsArray.find(item => {
        return item.paymentMethod === payment.paymentMethod && item.isBNPL === payment.isBNPL;
      });
    }
  }

  protected updateGeneralLimits() {
    if (this.widgetConfig) {
      this.widgetConfig.amountLimits.min = this.widgetConfig.payments
        .reduce((acc, next) => {
          return acc < next.amountLimits.min ? acc : next.amountLimits.min;
        }, this.widgetConfig.payments[0]?.amountLimits.min || 0);
      this.widgetConfig.amountLimits.max = this.widgetConfig.payments
        .reduce((acc, next) => {
          return acc > next.amountLimits.max ? acc : next.amountLimits.max;
        }, this.widgetConfig.payments[0]?.amountLimits.max || 0);
    }
  }

  protected abstract createForm(data: WidgetConfigInterface): void;

  protected abstract getUpdatedSettings(): WidgetConfigInterface;

  protected abstract updateWidgetSettings(): void;
}
