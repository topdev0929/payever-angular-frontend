import { CurrencyPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Observable, ReplaySubject, Subscription, throwError, timer } from 'rxjs';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';

import {
  CheckoutModeEnum,
  CheckoutAndCreditsInterface,
  RateInterface,
  RatesOrderEnum,
  WidgetConfigInterface,
  WidgetConfigPaymentInterface,
  PaymentItem,
  AddressInterface,
  ShippingOption,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';



@Directive()
export abstract class BaseWidgetComponent<TCreditInterface> implements OnChanges, OnDestroy {

  @Input() amount: number;

  @Input() channelSet: string;

  @Input() config: WidgetConfigInterface;

  @Input() cart: PaymentItem[];

  @Input() billingAddress: AddressInterface;

  @Input() shippingAddress: AddressInterface;

  @Input() shippingOption: ShippingOption;

  @Output('clicked') clickedEmitter: EventEmitter<void> = new EventEmitter();
  @Output('failed') failedEmitter: EventEmitter<void> = new EventEmitter();

  isLoadingRates = false;
  ratesAsc: RateInterface[];
  ratesDesc: RateInterface[];
  currency: string;
  error: string;

  protected destroy$: ReplaySubject<boolean> = new ReplaySubject();
  protected formattingLocale: string;

  protected currencyPipe: CurrencyPipe = this.injector.get(CurrencyPipe);
  protected percentPipe: PercentPipe = this.injector.get(PercentPipe);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);

  private getRatesSub: Subscription;
  private selectedRate: RateInterface;

  constructor(protected injector: Injector) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get rates(): RateInterface[] {
    return this.config.ratesOrder === RatesOrderEnum.Asc ? this.ratesAsc : this.ratesDesc;
  }

  get currentRate(): RateInterface {
    return this.rates ? (this.selectedRate || this.rates[this.rates.length - 1]) : null;
  }

  get isFinCalc(): boolean {
    return this.config?.checkoutMode && this.config.checkoutMode === CheckoutModeEnum.Calculator;
  }

  get hasShortToExtendedViewSwitcher(): boolean {
    return this.isFinCalc;
  }

  get isFinExp(): boolean {
    return this.config?.checkoutMode && this.config.checkoutMode === CheckoutModeEnum.FinanceExpress;
  }

  get isShowWrapperButtonVisible(): boolean {
    return this.isFinExp;
  }

  get isNone(): boolean {
    return this.config?.checkoutMode ? this.config.checkoutMode === CheckoutModeEnum.None : true;
  }

  get isBNPL(): boolean {
    return this.currentPayment?.isBNPL || false;
  }

  get productId(): string {
    return this.currentPayment?.productId || null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['amount']
      || changes['channelSet']
      || (changes['config']
        && !this.checkPaymentsEquality(
          changes['config'].currentValue.payments,
          changes['config'].previousValue?.payments
        )
      )
    ) {
      if (this.getRatesSub) {
        this.getRatesSub.unsubscribe();
      }
      this.getRatesSub = this.updateRates().pipe(takeUntil(this.destroy$)).subscribe();
    }
  }

  onRateSelected(rate: RateInterface): void {
    this.selectedRate = rate;
  }

  onClicked(): void {
    if (this.isShowWrapperButtonVisible) {
      this.clickedEmitter.emit();
    }
  }

  toPercent(value: number): string {
    return this.percentPipe.transform(value / 100, '1.0-2');
  }

  toPrice(value: number): string {
    return this.currencyPipe.transform(
      value,
      this.currency,
      'symbol-narrow',
      (value % 1 === 0) ? '1.0-2' : '1.2-2',
    );
  }

  toPriceNumber(value: number): string {
    return (this.toPrice(value) || '').replace(/[^\d\s,.-]/g, '').trim();
  }

  protected abstract getRates(): Observable<CheckoutAndCreditsInterface<TCreditInterface>>;

  protected abstract transformRate(rate: TCreditInterface): RateInterface;

  protected get currentPayment(): WidgetConfigPaymentInterface {
    return this.config?.payments?.find(a => this.amount
      && a.enabled
      && this.amount >= a.amountLimits.min
      && this.amount <= a.amountLimits.max
    );
  }

  protected updateRates(delay = 500): Observable<void> {
    this.isLoadingRates = true;
    this.error = null;

    return timer(delay).pipe(
      mergeMap(() =>
        this.getRates().pipe(
          takeUntil(this.destroy$),
          map((data) => {
            this.currency = data.currency;
            this.ratesAsc = data.rates.map(rate => this.transformRate(rate));
            this.selectedRate = this.ratesAsc?.[-1];
            this.ratesDesc = this.ratesAsc.map(a => a).reverse();
            this.isLoadingRates = false;
            this.cdr.detectChanges();

            return null;
          }),
          catchError((err) => {
            this.ratesAsc = this.ratesDesc = null;
            this.error = err?.error?.message || err?.message || 'Cant load rates!';
            this.isLoadingRates = false;
            this.failedEmitter.emit();
            this.cdr.detectChanges();

            return throwError(err);
          })
        )
      ),
    );
  }

  private checkPaymentsEquality(
    firstPayments: WidgetConfigPaymentInterface[],
    secondPayments: WidgetConfigPaymentInterface[],
  ): boolean {
    return firstPayments.every((payment, index) => {
      const correspondingPayment = secondPayments?.[index];

      return correspondingPayment
        && payment.paymentMethod === correspondingPayment.paymentMethod
        && payment?.amountLimits?.max === correspondingPayment?.amountLimits?.max
        && payment?.amountLimits?.min === correspondingPayment?.amountLimits?.min
        && payment.isBNPL === correspondingPayment.isBNPL
        && payment.productId === correspondingPayment.productId
        && payment.enabled === correspondingPayment.enabled;
    });
  }
}
