import { Directive, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';

import {
  BaseWidgetComponent as BaseBaseWidgetComponent,
} from '@pe/checkout/payment-widgets';
import {
  CheckoutAndCreditsInterface,
  RateInterface,
  WidgetTypeEnum,
  PaymentMethodEnum,
} from '@pe/checkout/types';

import { CreditInterface } from '../models';
import { WidgetsApiService } from '../services';


@Directive()
export abstract class BaseWidgetComponent extends BaseBaseWidgetComponent<CreditInterface> implements OnChanges {

  isExtendedView = false;

  readonly payment = PaymentMethodEnum.SANTANDER_INSTALLMENT;
  readonly isTwoFieldsCalculator: boolean = false;

  protected abstract widgetType: WidgetTypeEnum;

  private widgetsApiService = this.injector.get(WidgetsApiService);

  public get translations() {
    return {
      showWrapperTitle: $localize `:@@santander-de-finexp-widget.common.show_checkout_wrapper:`,
      moreInfoTitle: $localize `:@@santander-de-finexp-widget.common.show_more_info:`,
      headerText: $localize `:@@santander-de-finexp-widget.common.header_text:`,
      headerExtendedText: $localize `:@@santander-de-finexp-widget.common.header_text_extended:`,
      introductionText: $localize `:@@santander-de-finexp-widget.common.introduction_text:`,
      creditDetailsText: $localize `:@@santander-de-finexp-widget.common.credit_details_text:`,
    };
  }

  get forceDefaultStyles(): boolean {
    return this.isExtendedView; // In overlay (modal) we don't show custom styles
  }

  get isMoreInfoButtonVisible(): boolean {
    return this.hasShortToExtendedViewSwitcher && !this.isExtendedView;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isExtendedView = false;
    super.ngOnChanges(changes);
  }

  toMonths(count: number): string {
    return count === 1
      ? $localize `:@@santander-de-finexp-widget.common.month.one:${count}:count:`
      : $localize `:@@santander-de-finexp-widget.common.month.many:${count}:count:`;
  }

  getCreditFormatted(raw: CreditInterface = null) {
    raw = raw || this.currentRate?.raw;

    return raw
      ? {
          amount: this.amount,
          amount_with_currency: this.toPrice(this.amount),
          ...raw,
          duration_with_months: this.toMonths(raw.duration),
          monthly_rate_with_currency: this.toPrice(raw.monthlyPayment),
          interest_rate_with_persent: this.toPercent(raw.annualPercentageRate),
          rate_pa_with_persent: this.toPercent(raw.interestRate),
          price_with_currency: this.toPrice(raw.amount),
          bank_interest_with_currency: this.toPrice(raw.interest),
        }
      : {} as any;
  }

  onClicked(): void {
    if (this.hasShortToExtendedViewSwitcher && !this.isExtendedView) {
      this.isExtendedView = true;
    } else {
      super.onClicked();
    }
  }

  protected transformRate(credit: CreditInterface): RateInterface {
    const translations = this.translateRate(credit);
    const monthlyRate = this.toPrice(credit.monthlyPayment);

    return {
      listTitle: this.isTwoFieldsCalculator ? monthlyRate : translations.rateTitle,
      selectedTitle: translations.rateTitle,
      selectedMultiTitles: [
        {
          label: translations.rateParams.duration,
          text: this.toMonths(credit.duration),
        },
        {
          label: translations.rateParams.monthlyRate,
          text: monthlyRate,
        },
      ],
      details: [
        {
          title: translations.rateParams.interestRate,
          value: this.toPercent(credit.annualPercentageRate),
        },
        {
          title: translations.rateParams.ratePa,
          value: this.toPercent(credit.interestRate),
        },
        {
          title: translations.rateParams.totalAmount,
          value: this.toPrice(credit.totalCreditCost),
        },
        {
          title: translations.rateParams.bankInterest,
          value: this.toPrice(credit.interest),
        },
      ],
      value: String(credit.duration),
      raw: credit,
    };
  }

  protected getRates(): Observable<CheckoutAndCreditsInterface<CreditInterface>> {
    return this.widgetsApiService.getRates(
      this.channelSet,
      this.payment,
      this.amount,
      this.widgetType,
    );
  }

  private translateRate(credit: CreditInterface) {
    const { monthly_rate_with_currency, duration_with_months } = this.getCreditFormatted(credit);

    return {
      rateTitle: $localize `:@@santander-de-finexp-widget.common.rate_title:\
      ${monthly_rate_with_currency}:monthly_rate_with_currency:\
      ${duration_with_months}:duration_with_months:`,
      rateParams: {
        duration: $localize `:@@santander-de-finexp-widget.common.rate_param.duration:`,
        monthlyRate: $localize `:@@santander-de-finexp-widget.common.rate_param.monthly_rate:`,
        interestRate: $localize `:@@santander-de-finexp-widget.common.rate_param.interest_rate:`,
        ratePa: $localize `:@@santander-de-finexp-widget.common.rate_param.rate_pa:`,
        totalAmount: $localize `:@@santander-de-finexp-widget.common.rate_param.total_amount:`,
        bankInterest: $localize `:@@santander-de-finexp-widget.common.rate_param.bank_interest:`,
        price: $localize `:@@santander-de-finexp-widget.common.rate_param.price:`,
        cpi: $localize `:@@santander-de-finexp-widget.common.rate_param.cpi:`,
      },
    };
  }
}
