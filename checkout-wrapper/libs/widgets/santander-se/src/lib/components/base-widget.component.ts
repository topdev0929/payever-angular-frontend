import { Directive, OnChanges, SimpleChanges } from '@angular/core';
import dayjs from 'dayjs';
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

  readonly payment = PaymentMethodEnum.SANTANDER_INSTALLMENT_SE;
  readonly isTwoFieldsCalculator: boolean = false;

  protected abstract widgetType: WidgetTypeEnum;

  private widgetsApiService = this.injector.get(WidgetsApiService);

  public get translations() {
    return this.translateRate();
  }

  get forceDefaultStyles(): boolean {
    return this.isExtendedView; // In overlay (modal) we don't show custom styles
  }

  get isMoreInfoButtonVisible(): boolean {
    return this.hasShortToExtendedViewSwitcher && !this.isExtendedView;
  }

  get isShowSelectedRateDetails(): boolean {
    return true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isExtendedView = false;
    super.ngOnChanges(changes);
  }

  toMonths(count: number): string {
    return count === 1
      ? $localize `:@@santander-se-finexp-widget.common.month.one:${count}:count:`
      : $localize `:@@santander-se-finexp-widget.common.month.many:${count}:count:`;
  }

  getCreditFormatted(raw: CreditInterface = null): any {
    raw = raw || this.currentRate?.raw;

    return raw ? {
      month_name: this.getMonthNameBNPL(raw.months), // Only for BNPL
      amount: this.amount,
      amount_with_currency: this.toPrice(this.amount),
      ...raw,
      months_with_months: this.toMonths(raw.months),
      monthly_cost_with_currency: this.toPrice(raw.monthlyCost),
      effective_interest_with_persent: this.toPercent(raw.effectiveInterest),
      total_cost_with_currency: this.toPrice(raw.totalCost),
      startup_fee_with_currency: this.toPrice(raw.startupFee),
      annual_fee_with_currency: this.toPrice(raw.annualFee),
      billing_fee_with_currency: this.toPrice(raw.billingFee),
    } : {};
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
    const line = allTranslations.rateTitle;
    const monthName = this.getMonthNameBNPL(credit.months);
    const months = this.toMonths(credit.months);
    const startupFee = this.toPrice(credit.startupFee);
    const monthlyCost = this.toPrice(credit.monthlyCost);
    const twoFieldsListTitle = this.isBNPL ? monthName : months;

    return {
      listTitle: this.isTwoFieldsCalculator ? twoFieldsListTitle : line,
      selectedTitle: line,
      selectedMultiTitles:
        this.isBNPL
          ? [
            { label: this.translations.rateParams.startupFee, text: startupFee },
            { label: this.translations.rateParams.monthName, text: monthName },
          ]
          : [
            { label: this.translations.rateParams.monthlyCost, text: monthlyCost },
            { label: this.translations.rateParams.months, text: months },
          ],
      details: [
        {
          title: this.translations.rateParams.effectiveInterest,
          value: this.toPercent(credit.effectiveInterest),
        },
        {
          title: this.translations.rateParams.totalCost,
          value: this.toPrice(credit.totalCost),
        },
        {
          title: this.translations.rateParams.startupFee,
          value: this.toPrice(credit.startupFee),
        },
        {
          title: this.translations.rateParams.baseInterestRate,
          value: this.toPercent(credit.baseInterestRate),
        },
        {
          title: this.translations.rateParams.billingFee,
          value: this.toPrice(credit.billingFee),
        },
      ],
      value: String(credit.code),
      raw: credit,
    };
  }

  protected getRates(): Observable<CheckoutAndCreditsInterface<CreditInterface>> {
    return this.widgetsApiService.getRates(
      this.channelSet,
      this.payment,
      this.isBNPL,
      this.amount,
      this.widgetType,
    );
  }

  protected getMonthNameBNPL(months: number): string {
    const moment = dayjs().add(months, 'months');

    return moment.locale(this.localeConstantsService.getLang()).format('MMMM');
  }

  private translateRate(credit?: CreditInterface) {
    const {
      total_cost_with_currency,
      month_name,
      monthly_cost_with_currency,
      months_with_months,
      effective_rate_with_persent,
      amount_with_currency,
      duration,
      credit_price_with_currency,
      credit_purchase_with_currency,
    } = this.getCreditFormatted(credit);

    const allTranslations = {
      bnpl: {
        rateTitle: $localize `:@@santander-se-finexp-widget.bnpl.rate_title:\
        ${total_cost_with_currency}:total_cost_with_currency:\
        ${month_name}:month_name:`,
        showWrapperTitle: $localize `:@@santander-se-finexp-widget.bnpl.show_checkout_wrapper:`,
        moreInfoTitle: $localize `:@@santander-se-finexp-widget.bnpl.show_more_info:`,
        headerText: $localize `:@@santander-se-finexp-widget.bnpl.finance-express.header_text:`,
        headerExtendedText: $localize `:@@santander-se-finexp-widget.bnpl.header_text_extended:`,
        introductionText: $localize `:@@santander-se-finexp-widget.bnpl.introduction_text:`,
        creditDetailsText: $localize `:@@santander-se-finexp-widget.bnpl.credit_details_text:\
        ${effective_rate_with_persent}:effective_rate_with_persent:\
        ${amount_with_currency}:amount_with_currency:\
        ${duration}:duration:\
        ${credit_price_with_currency}:credit_price_with_currency:\
        ${credit_purchase_with_currency}:credit_purchase_with_currency:`,
        rateParams: {
          billingFee: $localize `:@@santander-se-finexp-widget.bnpl.rate_param.billing_fee:`,
        },
      },
      regular: {
        rateTitle: $localize `:@@santander-se-finexp-widget.regular.rate_title:\
        ${monthly_cost_with_currency}:monthly_cost_with_currency:\
        ${months_with_months}:months_with_months:`,
        showWrapperTitle: $localize `:@@santander-se-finexp-widget.regular.show_checkout_wrapper:`,
        moreInfoTitle: $localize `:@@santander-se-finexp-widget.regular.show_more_info:`,
        headerText: $localize `:@@santander-se-finexp-widget.regular.finance-express.header_text:`,
        headerExtendedText: $localize `:@@santander-se-finexp-widget.regular.header_text_extended:`,
        introductionText: $localize `:@@santander-se-finexp-widget.regular.introduction_text:`,
        creditDetailsText: $localize `:@@santander-se-finexp-widget.regular.credit_details_text:`,
        rateParams: {
          billingFee: $localize `:@@santander-se-finexp-widget.regular.rate_param.billing_fee:`,
        },
      },
      common: {
        months: $localize `:@@santander-se-finexp-widget.common.rate_param.months:`,
        monthlyCost: $localize `:@@santander-se-finexp-widget.common.rate_param.monthly_cost:`,
        monthName: $localize `:@@santander-se-finexp-widget.common.rate_param.month_name:`,
        effectiveInterest: $localize `:@@santander-se-finexp-widget.common.rate_param.effective_interest:`,
        totalCost: $localize `:@@santander-se-finexp-widget.common.rate_param.total_cost:`,
        startupFee: $localize `:@@santander-se-finexp-widget.common.rate_param.startup_fee:`,
        annualFee: $localize `:@@santander-se-finexp-widget.common.rate_param.annual_fee:`,
        baseInterestRate: $localize `:@@santander-se-finexp-widget.common.rate_param.interest_rate:`,
      },
    };

    const translation = this.isBNPL ? allTranslations.bnpl : allTranslations.regular;

    return {
      ...translation,
      rateParams: {
        ...translation.rateParams,
        ...allTranslations.common,
      },
    };
  }
}
