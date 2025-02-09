import { CurrencyPipe, PercentPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  OnInit,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import {
  ReplaySubject,
  Subject,
  defer,
  merge,
  of,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  retryWhen,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { AnalyticActionEnum, AnalyticFormStatusEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { CompositeForm } from '@pe/checkout/forms';
import { RateDetailInterface, RateAccordionDetailInterface, DetailInterface } from '@pe/checkout/rates';
import { FlowExtraDurationType, PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  RateInterface,
  RatesFormValue,
  ProductInterface,
  ProductsCalculationService,
  RatesCalculationService,
} from '../../../shared';
import { getPaymentPeriod } from '../../utils';

interface FetchProductsParams {
  total: number;
}

interface ViewModel {
  products: ProductInterface[];
  viewProducts: RateAccordionDetailInterface[];
  rates: RateInterface[];
  viewRates: RateDetailInterface[];
}

const ANALYTICS_FORM_NAME = 'FORM_RATE_SELECT';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-dk-rates-edit-list',
  providers: [CurrencyPipe, PercentPipe, PeDestroyService ],
  templateUrl: './rates-edit-list.component.html',
  styleUrls: ['./rates-edit-list.component.scss'],
})
export class RatesEditListComponent extends CompositeForm<any> implements OnInit, OnDestroy {

  private currencyPipe = this.injector.get(CurrencyPipe);
  private percentPipe = this.injector.get(PercentPipe);
  private analyticsFormService = this.injector.get(AnalyticsFormService);
  private ratesCalculationService = this.injector.get(RatesCalculationService);
  private productsCalculationService = this.injector.get(ProductsCalculationService);

  public formGroup = this.fb.group({
    _isSafeInsuranceAllowed: this.fb.control<boolean>(null),
    productId: this.fb.control<string>(null),
    monthlyAmount: this.fb.control<number>(null),
    totalCreditAmount: this.fb.control<number>(null),
    creditDurationInMonths: this.fb.control<number>(null),
  });

  @Input() flowId: string;
  @Input() paymentMethod: PaymentMethodEnum;
  @Input() connectionId: string;
  @Input() currency: string;

  @Input() set total(total: number) {
    if (this._total !== total) {
      this.fetchProductsSubject$.next({ total });
    }
    this._total = total;
  }

  @Input() extraDuration: FlowExtraDurationType;

  @Output() ratesLoaded = new EventEmitter<void>();
  @Output() fetchingRates = new EventEmitter<boolean>();
  @Output() hasFetchError = new EventEmitter<boolean>();
  @Output() selected = new EventEmitter<RateInterface>();
  @Output() productPanelOpened = new EventEmitter<number>();

  public details: DetailInterface[];
  public productsLoadError: string;
  public ratesLoadError: string;
  public doSelectProduct$ = new ReplaySubject<string>(1);
  public doSelectRate$ = new ReplaySubject<string>(1);

  private _total: number;

  private fetchProductsSubject$ = new ReplaySubject<FetchProductsParams>(1);
  private products$ = this.fetchProductsSubject$.pipe(
    tap(() => this.fetchingRates.emit(true)),
    scan((acc, curr) => ({ ...acc, ...curr }), {} as FetchProductsParams),
    switchMap(() => this.productsCalculationService.getProducts().pipe(
      catchError((err) => {
        this.productsLoadError = err.message;

        return of([] as ProductInterface[]);
      }),
      tap((products) => {
        !products.length && this.selected.emit(null);
      }),
      finalize(() => this.fetchingRates.emit(false)),
      takeUntil(this.destroy$),
    )),
    filter(value => !!value),
    shareReplay(1),
  );

  private fetchRatesSubject$ = new Subject<void>();
  private rates$ = defer(() => this.formGroup.get('productId').valueChanges.pipe(
    startWith(this.formGroup.get('productId').value),
    filter(value => !!value),
    distinctUntilChanged(),
    tap(() => this.fetchingRates.emit(true)),
    switchMap(productId => this.ratesCalculationService.getRates(productId).pipe(
      catchError((err) => {
        this.ratesLoadError = err.message;

        return of([] as RateInterface[]);
      }),
      tap((rates) => {
        !rates.length && this.selected.emit(null);

        rates.length && this.selectRateOnInit(rates);
      }),
      retryWhen(() => this.fetchRatesSubject$),
      finalize(() => this.fetchingRates.emit(false)),
      takeUntil(this.destroy$),
    )),
    shareReplay(1),
  ));

  public vm$ = merge(
    this.products$.pipe(
      map(products => ({
        viewProducts: products.map(product => this.transformProduct(product)),
        products,
      })),
    ),
    this.rates$.pipe(
      map(rates => ({
        rates,
        viewRates: rates.map(rate => this.transformRate(rate)),
      })),
    ),
  ).pipe(
    scan((acc, curr) => ({ ...acc, ...curr }), {} as ViewModel),
  );

  ngOnInit(): void {
    this.products$.pipe(
      tap((products) => {
        products.length && this.selectProductOnInit(products);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.OPEN);
  }

  ngOnDestroy(): void {
    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.CLOSED);
  }

  public fetchProducts(): void {
    this.productsLoadError = null;
    this.fetchProductsSubject$.next(null);
  }

  public fetchRates(): void {
    this.ratesLoadError = null;
    this.fetchRatesSubject$.next();
  }

  public productSelected(id: string | number, products: ProductInterface[]): void {
    const selectedProduct = products.find(product => product.id.toString() === id.toString());

    if (this.formGroup.value.productId?.toString() !== id.toString()) {
      this.formGroup.setValue({
        _isSafeInsuranceAllowed: selectedProduct.isSafeInsuranceAllowed,
        productId: String(selectedProduct.id),
        monthlyAmount: null,
        totalCreditAmount: null,
        creditDurationInMonths: null,
      });
    }

    this.analyticsFormService.emitEventForm(ANALYTICS_FORM_NAME, {
      field: 'Choose product',
      action: AnalyticActionEnum.CHANGE,
    });
  }

  public rateSelected(id: string, rates: RateInterface[]): void {
    const rate = rates.find(rate => this.makeRateId(rate) === id);
    this.formGroup.patchValue({
      monthlyAmount: rate.result.monthlyPayment,
      totalCreditAmount: rate.result.totalLoanAmount,
      creditDurationInMonths: getPaymentPeriod(rate),
    });
    this.selected.emit(rate);
    this.updateDetails(rate);

    this.analyticsFormService.emitEventForm(ANALYTICS_FORM_NAME, {
      field: 'Choose rate',
      action: AnalyticActionEnum.CHANGE,
    });
  }


  public makeRateId(rate: RateInterface): string {
    return rate ? `${getPaymentPeriod(rate)}_${rate.result.totalLoanAmount}` : null;
  }

  private selectProductOnInit(products: ProductInterface[]): void {
    const initialProduct = products.find(p => p.id === Number(this.formGroup.value.productId)) || products[0];
    this.productSelected(initialProduct.id, products);
    this.doSelectProduct$.next(initialProduct.id.toString());
  }

  private selectRateOnInit(rates: RateInterface[]): void {
    const initialRate = this.getRateByFormData(
      this.formGroup.value as RatesFormValue,
      rates,
    )
      ?? rates.find(r => r.isDefault)
      ?? rates[0];
    this.doSelectRate$.next(this.makeRateId(initialRate));
  }

  private updateDetails(rate: RateInterface): void {
    this.details = [
      {
        title: $localize `:@@santander-dk.credit_rates.rate_param.annually_procent:`,
        value: rate ? this.toPercent(rate.result?.annuallyProcent) : null,
      },
      {
        title: $localize `:@@santander-dk.credit_rates.rate_param.effective_interest:`,
        value: rate ? this.toPercent(rate.parameters?.effectiveInterest) : null,
      },
      {
        title: $localize `:@@santander-dk.credit_rates.rate_param.total_cost:`,
        value: rate ? this.toPrice(rate.result?.totalCost) : null,
      },
      {
        title: $localize `:@@santander-dk.credit_rates.rate_param.total_loan_amount:`,
        value: rate ? this.toPrice(rate.result?.totalLoanAmount) : null,
      },
      {
        title: $localize `:@@santander-dk.credit_rates.rate_param.establishment_fee:`,
        value: rate ? this.toPrice(rate.parameters?.establishmentFee) : null,
      },
    ];
    if (rate?.interestFreeType) {
      this.details.push({
        title: $localize `:@@santander-dk.credit_rates.rate_param.interest_free_duration:`,
        value: $localize `:@@santander-dk.duration.count_months:${rate.result.paymentFreeDuration}:count:`,
      });
    }
    if (!rate?.interestFreeType && rate?.result?.paymentFreeDuration) {
      this.details.push({
        title: $localize `:@@santander-dk.credit_rates.rate_param.payment_free_duration:`,
        value: $localize `:@@santander-dk.duration.count_months:${rate.result.paymentFreeDuration}:count:`,
      });
    }
  }

  private toPercent(value: number): string { // Copied from @pe/checkout/payment-widgets-sdk
    return this.percentPipe.transform(value / 100, '1.0-2');
  }

  private toPrice(value: number): string { // Copied from @pe/checkout/payment-widgets-sdk
    return this.currencyPipe.transform(value, this.currency, 'symbol', (value % 1 === 0) ? '1.0-2' : '1.2-2');
  }

  private transformProduct(product: ProductInterface): RateAccordionDetailInterface {
    const count = `${product.minMonth}&ndash;${product.maxMonth}`;

    return {
      id: product.id.toString(),
      title: product.name,
      description: $localize `:@@santander-dk.duration.count_months_short:${count}:count:`,
    } as RateAccordionDetailInterface;
  }

  private transformRate(rate: RateInterface): RateDetailInterface {
    const payment_duration = $localize `:@@santander-dk.duration.count_months:${rate.result.termsInMonth || 0}:count:`;
    const paymentFreeDuration = $localize `:@@santander-dk.duration.count_months:${rate.result.paymentFreeDuration}:count:`;

    const title: string = $localize `:@@santander-dk.credit_rates.rate_dropdown.title:\
      ${this.toPrice(rate.result.monthlyPayment)}:monthly_payment:\
      ${payment_duration}:payment_duration:`;

    return {
      id: this.makeRateId(rate),
      title: title,
      header: rate.payLaterType ? [
        $localize `:@@santander-dk.credit_rates.rate_dropdown.pretitle:${paymentFreeDuration}:payment_free_duration:`,
      ] : null,
      lines: [],
    } as RateDetailInterface;
  }

  private getRateByFormData(initialData: RatesFormValue, rates: RateInterface[]): RateInterface {
    return rates.find(rate => initialData
      && initialData.monthlyAmount?.toString() === rate.result.monthlyPayment?.toString()
      && initialData.totalCreditAmount?.toString() === rate.result.totalLoanAmount?.toString()
      && initialData.creditDurationInMonths?.toString() === getPaymentPeriod(rate)?.toString()
    );
  }
}
