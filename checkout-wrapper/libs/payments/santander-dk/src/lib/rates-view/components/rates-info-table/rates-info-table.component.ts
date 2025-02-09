import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  ProductInterface,
  ProductsCalculationService,
  RateInterface,
  RatesCalculationService,
  SelectedRateDataInterface,
} from '../../../shared';
import { RatesInfoTableTranslationsInterface } from '../../interface';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-dk-rates-info-table',
  templateUrl: './rates-info-table.component.html',
  styles: [':host { display: block; font-weight: 400; }'],
  providers: [
    PeDestroyService,
    ProductsCalculationService,
    RatesCalculationService,
  ],
})
export class RatesInfoTableComponent implements OnInit {

  @Input() flowId: string;
  @Input() paymentMethod: PaymentMethodEnum;
  @Input() connectionId: string;
  @Input() initialData: SelectedRateDataInterface;
  @Input() total: number;
  @Input() currency: string;
  @Input() paymentTitle: string;

  selectedProduct: ProductInterface = null;
  selectedRate$ = new BehaviorSubject<RateInterface>(null);
  translations$ = new BehaviorSubject<RatesInfoTableTranslationsInterface>(null);

  constructor(
    private productsCalculationService: ProductsCalculationService,
    private ratesCalculationService: RatesCalculationService,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  initTranslations(selectedRate: RateInterface): void {
    this.translations$.next({
      freeTypeText: selectedRate
        ? $localize `:@@santander-dk.credit_rates.rate_param.interest_free_duration:`
        : $localize `:@@santander-dk.credit_rates.rate_param.payment_free_duration:`,
      paymentFreeText: selectedRate?.result?.paymentFreeDuration
        ? $localize `:@@santander-dk.duration.one_month:${selectedRate?.result?.paymentFreeDuration}:count:`
        : $localize `:@@santander-dk.duration.count_months:${selectedRate?.result?.paymentFreeDuration}:count:`,
      paymentPeriodMonthText: $localize `:@@santander-dk.duration.one_month:${this.getPaymentPeriod(selectedRate)}:count:`,
      paymentPeriodMonthsText: $localize `:@@santander-dk.duration.count_months:${this.getPaymentPeriod(selectedRate)}:count:`,

    });
  }

  fetchProducts(): void {
    if (this.total && this.currency) {
      this.productsCalculationService.getProducts().pipe(
        switchMap((products) => {
          this.selectedProduct = this.getProductByFormData(this.initialData, products);

          return products.length && this.selectedProduct
            ? this.ratesCalculationService.getRates(this.selectedProduct.id.toString()) : EMPTY;
        }),
        tap((rates) => {
          this.selectedRate$.next(this.getRateByFormData(this.initialData, rates));
          this.initTranslations(this.selectedRate$.value);
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  public getPaymentPeriod(creditOption: RateInterface): number {
    return creditOption?.payLaterType
      ? creditOption?.parameters?.loanDurationInMonths + creditOption?.result?.paymentFreeDuration
      : creditOption?.parameters?.loanDurationInMonths;
  }

  protected getProductByFormData(
    initialData: SelectedRateDataInterface,
    products: ProductInterface[],
  ): ProductInterface {
    return products.find(product => initialData &&
        String(initialData.productId) === String(product.id) &&
        String(initialData._isSafeInsuranceAllowed) === String(product.isSafeInsuranceAllowed));
  }

  protected getRateByFormData(initialData: SelectedRateDataInterface, rates: RateInterface[]): RateInterface {
    return rates.find(rate => initialData
      && initialData.monthlyAmount?.toString() === rate.result.monthlyPayment?.toString()
      && initialData.totalCreditAmount?.toString() === rate.result.totalLoanAmount?.toString()
      && initialData.creditDurationInMonths?.toString() === this.getPaymentPeriod(rate)?.toString()
    );
  }
}
