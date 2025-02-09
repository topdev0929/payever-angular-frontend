import { Directive, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';

import {
  BaseWidgetComponent as BaseSdkWidgetComponent,
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
export abstract class BaseWidgetComponent extends BaseSdkWidgetComponent<CreditInterface> implements OnChanges {

  isExtendedView = false;

  readonly payment = PaymentMethodEnum.SANTANDER_INSTALLMENT_AT;
  readonly isTwoFieldsCalculator: boolean = false;
  readonly isRateTextTitle: boolean = false;

  protected abstract widgetType: WidgetTypeEnum;

  private widgetsApiService: WidgetsApiService = this.injector.get(WidgetsApiService);

  public get translations() {
    return {
      showWrapperTitle: $localize `:@@santander-at-finexp-widget.common.show_checkout_wrapper:`,
      moreInfoTitle: $localize `:@@santander-at-finexp-widget.common.show_more_info:`,
      headerText: $localize `:@@santander-at-finexp-widget.common.header_text:`,
      headerExtendedText: $localize `:@@santander-at-finexp-widget.common.header_text_extended:`,
      introductionText: $localize `:@@santander-at-finexp-widget.common.introduction_text:`,
      creditDetailsText: $localize `:@@santander-at-finexp-widget.common.credit_details_text:`,
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
      ? $localize `:@@santander-at-finexp-widget.common.month.one:${count}:count:`
      : $localize `:@@santander-at-finexp-widget.common.month.many:${count}:count:`;
  }

  getCreditFormatted(raw: CreditInterface = null): any {
    raw = raw || this.currentRate?.raw;

    return raw
      ? {
          amount: this.amount,
          amount_with_currency: this.toPrice(this.amount),
          ...raw,
          duration_with_months: this.toMonths(raw.duration),
          monthly_rate_with_currency: this.toPrice(raw.monthlyPayment),
          duration: raw.duration,

          last_rate_with_currency: this.toPrice(raw.lastMonthPayment),
          annual_percentage_rate_with_persent: this.toPercent(raw.annualPercentageRate),
          total_interest_with_currency: this.toPrice(raw.interest),
          total_with_currency: this.toPrice(raw.totalCreditCost),
          nominal_interest_rate_with_persent: this.toPercent(raw.interestRate),
        }
      : null;
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
    const monthlyPayment = this.toPrice(credit.monthlyPayment);
    const line = this.isRateTextTitle ? translations.rateTitle : translations.rateSelectTitle;

    return {
      listTitle: this.isTwoFieldsCalculator ? monthlyPayment : line,
      selectedTitle: line,
      selectedMultiTitles: [
        {
          label: translations.rateParams.duration,
          text: this.toMonths(credit.duration),
        },
        {
          label: translations.rateParams.monthlyRate,
          text: monthlyPayment,
        },
      ],
      details: [
        {
          title: translations.rateParams.annualPercentageRate,
          value: this.toPercent(credit.annualPercentageRate),
        },
        {
          title: translations.rateParams.nominalInterestRate,
          value: this.toPercent(credit.interestRate),
        },
        {
          title: translations.rateParams.total,
          value: this.toPrice(credit.totalCreditCost),
        },
      ],
      value: String(credit.duration),
      raw: credit,
      isOneLine: true,
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
    const { monthly_rate_with_currency, duration_with_months } = this.getCreditFormatted(credit) || {};

    return {
      rateTitle: $localize `:@@santander-at-finexp-widget.common.rate_title:\
      ${monthly_rate_with_currency}:monthly_rate_with_currency:\
      ${duration_with_months}:duration_with_months:`,
      rateSelectTitle: $localize `:@@santander-at-finexp-widget.common.rate_select_title:\
      ${monthly_rate_with_currency}:monthly_rate_with_currency:\
      ${duration_with_months}:duration_with_months:`,
      rateParams: {
        duration: $localize `:@@santander-at-finexp-widget.common.rate_param.duration:`,
        monthlyRate: $localize `:@@santander-at-finexp-widget.common.rate_param.monthly_rate:`,
        annualPercentageRate: $localize `:@@santander-at-finexp-widget.common.rate_param.annual_percentage_rate:`,
        nominalInterestRate: $localize `:@@santander-at-finexp-widget.common.rate_param.nominal_interest_rate:`,
        total: $localize `:@@santander-at-finexp-widget.common.rate_param.total:`,
      },
    };
  }
}
