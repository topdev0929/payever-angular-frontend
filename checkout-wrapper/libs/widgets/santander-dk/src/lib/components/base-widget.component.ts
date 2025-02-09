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

  readonly payment = PaymentMethodEnum.SANTANDER_INSTALLMENT_DK;
  readonly isTwoFieldsCalculator: boolean = false;

  protected abstract widgetType: WidgetTypeEnum;

  private widgetsApiService: WidgetsApiService = this.injector.get(WidgetsApiService);

  public get translations() {
    const {
      payment_duration,
      payment_free_duration,
      payment_free_duration_with_months,
    } = this.getCreditFormatted();

    const allTranslations = {
      bnpl: {
        showWrapperTitle: $localize `:@@santander-dk-finexp-widget.bnpl.show_checkout_wrapper:`,
        moreInfoTitle: $localize `:@@santander-dk-finexp-widget.bnpl.show_more_info:`,
        headerText: $localize `:@@santander-dk-finexp-widget.bnpl.finance-express.header_text:${payment_free_duration_with_months}:payment_free_duration_with_months:`,
        headerExtendedText: $localize `:@@santander-dk-finexp-widget.bnpl.header_text_extended:`,
        introductionText: $localize `:@@santander-dk-finexp-widget.bnpl.introduction_text:`,
        creditDetailsText: $localize `:@@santander-dk-finexp-widget.bnpl.credit_details_text:${payment_duration}:payment_duration:${payment_free_duration}:payment_free_duration:`,
      },
      regular: {
        showWrapperTitle: $localize `:@@santander-dk-finexp-widget.regular.show_checkout_wrapper:`,
        moreInfoTitle: $localize `:@@santander-dk-finexp-widget.regular.show_more_info:`,
        headerText: $localize `:@@santander-dk-finexp-widget.regular.finance-express.header_text:`,
        headerExtendedText: $localize `:@@santander-dk-finexp-widget.regular.header_text_extended:`,
        introductionText: $localize `:@@santander-dk-finexp-widget.regular.introduction_text:`,
        creditDetailsText: $localize `:@@santander-dk-finexp-widget.regular.credit_details_text:`,
      },
    };

    const translation = this.isBNPL ? allTranslations.bnpl : allTranslations.regular;

    return {
      ...translation,
    };
  }

  get forceDefaultStyles(): boolean {
    return this.isExtendedView; // In overlay (modal) we don't show custom styles
  }

  get hasAOP(): boolean {
    return this.currentRate && this.currentRate.raw.result.annuallyProcent > 0.0;
  }

  get isMoreInfoButtonVisible(): boolean {
    return this.hasShortToExtendedViewSwitcher && !this.isExtendedView;
  }

  get isShowSelectedRateDetails(): boolean {
    return this.hasAOP;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isExtendedView = false;
    super.ngOnChanges(changes);
  }

  toMonths(count: number): string {
    return count === 1
      ? $localize `:@@santander-dk-finexp-widget.common.month.one:${count}:count:`
      : $localize `:@@santander-dk-finexp-widget.common.month.many:${count}:count:`;
  }

  getCreditFormatted(raw: CreditInterface = null): any {
    raw = raw || this.currentRate?.raw;

    return raw ? {
      amount: this.amount,
      amount_with_currency: this.toPrice(this.amount),
      ...this.objectKeysToSnakeCase(raw.parameters),
      ...this.objectKeysToSnakeCase(raw.result),
      payment_free_duration_with_months: this.toMonths(raw.result.paymentFreeDuration),
      payment_duration: raw.result.paymentFreeDuration + raw.result.termsInMonth,
      payment_duration_with_months: this.toMonths(raw.result.paymentFreeDuration + raw.result.termsInMonth),

      terms_in_month_with_months: this.toMonths(raw.result.termsInMonth),
      monthly_payment_with_currency: this.toPrice(raw.result.monthlyPayment),

      effective_interest_with_persent: this.toPercent(raw.parameters.effectiveInterest),
      annually_procent_with_persent: this.toPercent(raw.result.annuallyProcent),
      total_cost_with_currency: this.toPrice(raw.result.totalCost),
      total_loan_amount_with_currency: this.toPrice(raw.result.totalLoanAmount),
    } : { terms_in_month_with_months: '...', payment_free_duration_with_months: '...' };
  }

  onClicked(): void {
    if (this.hasShortToExtendedViewSwitcher && !this.isExtendedView) {
      this.isExtendedView = true;
    } else {
      super.onClicked();
    }
  }

  protected transformRate(credit: CreditInterface): RateInterface {
    const allTranslations = this.translateRate(credit);
    const translations = this.isBNPL ? allTranslations.bnpl : allTranslations.regular;
    const line = translations.rateTitle;
    const monthlyPayment = this.toPrice(credit.result.monthlyPayment);

    return {
      listTitle: this.isTwoFieldsCalculator ? monthlyPayment : line,
      selectedTitle: line,
      selectedMultiTitles: [
        { label: translations.rateParams.termsInMonth, text: this.toMonths(credit.result.termsInMonth) },
        { label: allTranslations.common.monthlyPayment, text: monthlyPayment },
      ],
      details: [
        {
          title: allTranslations.common.effectiveInterest,
          value: this.toPercent(credit.parameters.effectiveInterest),
        },
        {
          title: allTranslations.common.annuallyProcent,
          value: this.toPercent(credit.result.annuallyProcent),
        },
        {
          title: allTranslations.common.totalCost,
          value: this.toPrice(credit.result.totalCost),
        },
        {
          title: allTranslations.common.totalLoanAmount,
          value: this.toPrice(credit.result.totalLoanAmount),
        },
      ],
      value: String(`${credit.result.totalLoanAmount}|${credit.parameters.loanDurationInMonths}${credit.result.paymentFreeDuration}`),
      raw: credit,
    };
  }

  protected getRates(): Observable<CheckoutAndCreditsInterface<CreditInterface>> {
    return this.widgetsApiService.getRates(
      this.channelSet,
      this.payment,
      this.productId,
      this.amount,
      this.widgetType,
    );
  }

  protected objectKeysToSnakeCase(data: {[key: string]: any}): object {
    const result: {[key: string]: any} = {};
    Object.entries(data).forEach(([key, value]) => {
      const snakeCaseKey = key.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`).replace(/^_/, '');
      result[snakeCaseKey] = value;
    });

    return result;
  }

  private translateRate(credit: CreditInterface) {
    const {
      monthly_payment_with_currency,
      terms_in_month_with_months,
      payment_free_duration,
      terms_in_month,
    } = this.getCreditFormatted(credit);

    return {
      bnpl: {
        rateTitle: $localize `:@@santander-dk-finexp-widget.bnpl.rate_title:\
          ${payment_free_duration}:payment_free_duration:\
          ${monthly_payment_with_currency}:monthly_payment_with_currency::\
          ${terms_in_month}:terms_in_month:`,
        rateParams: {
          termsInMonth: $localize `:@@santander-dk-finexp-widget.bnpl.rate_param.terms_in_month:`,
        },
      },
      regular: {
        rateTitle: $localize `:@@santander-dk-finexp-widget.regular.rate_title:\
        ${monthly_payment_with_currency}:monthly_payment_with_currency:\
        ${terms_in_month_with_months}:terms_in_month_with_months:`,
        rateParams: {
          termsInMonth: $localize `:@@santander-dk-finexp-widget.regular.rate_param.terms_in_month:`,
        },
      },
      common: {
        monthlyPayment: $localize `:@@santander-dk-finexp-widget.common.rate_param.monthly_payment:`,
        effectiveInterest: $localize `:@@santander-dk-finexp-widget.common.rate_param.effective_interest:`,
        annuallyProcent: $localize `:@@santander-dk-finexp-widget.common.rate_param.annually_procent:`,
        totalCost: $localize `:@@santander-dk-finexp-widget.common.rate_param.total_cost:`,
        totalLoanAmount: $localize `:@@santander-dk-finexp-widget.common.rate_param.total_loan_amount:`,
      },
    };
  }
}
