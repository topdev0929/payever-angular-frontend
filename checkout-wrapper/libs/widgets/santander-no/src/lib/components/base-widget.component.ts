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

  readonly payment = PaymentMethodEnum.SANTANDER_INSTALLMENT_NO;
  readonly isTwoFieldsCalculator: boolean = false;

  protected abstract widgetType: WidgetTypeEnum;

  private widgetsApiService: WidgetsApiService = this.injector.get(WidgetsApiService);

  public get translations(): any {
    const {
      amount_with_currency,
      credit_price_with_currency,
      credit_purchase_with_currency,
      effective_rate_with_persent,
      duration,
    } = this.getCreditFormatted();

    const allTranslations = {
      bnpl: {
        showWrapperTitle: $localize `:@@santander-no-finexp-widget.bnpl.show_checkout_wrapper:`,
        moreInfoTitle: $localize `:@@santander-no-finexp-widget.bnpl.show_more_info:`,
        headerText: $localize `:@@santander-no-finexp-widget.bnpl.finance-express.header_text:`,
        headerExtendedText: $localize `:@@santander-no-finexp-widget.bnpl.header_text_extended:`,
        introductionText: $localize `:@@santander-no-finexp-widget.bnpl.introduction_text:`,
        creditDetailsText: $localize `:@@santander-no-finexp-widget.bnpl.credit_details_text:\
        ${effective_rate_with_persent}:effective_rate_with_persent:\
        ${amount_with_currency}:amount_with_currency:\
        ${duration}:duration:\
        ${credit_price_with_currency}:credit_price_with_currency:\
        ${credit_purchase_with_currency}:credit_purchase_with_currency:`,
      },
      regular: {
        showWrapperTitle: $localize `:@@santander-no-finexp-widget.regular.show_checkout_wrapper:`,
        moreInfoTitle: $localize `:@@santander-no-finexp-widget.regular.show_more_info:`,
        headerText: $localize `:@@santander-no-finexp-widget.regular.finance-express.header_text:`,
        headerExtendedText: $localize `:@@santander-no-finexp-widget.regular.header_text_extended:`,
        introductionText: $localize `:@@santander-no-finexp-widget.regular.introduction_text:`,
        creditDetailsText: $localize `:@@santander-no-finexp-widget.regular.credit_details_text:`,
      },
      common: {
        introductionText: $localize`:@@santander-no-finexp-widget.common.introduction_text:`,
      },
    };

    const translation = this.isBNPL ? allTranslations.bnpl : allTranslations.regular;

    return {
      ...allTranslations.common,
      ...translation,
    };
  }

  get forceDefaultStyles(): boolean {
    return this.isExtendedView; // In overlay (modal) we don't show custom styles
  }

  get isMoreInfoButtonVisible(): boolean {
    return this.hasShortToExtendedViewSwitcher && !this.isExtendedView;
  }

  get isShowSelectedRateDetails(): boolean {
    return !this.isBNPL;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isExtendedView = false;
    super.ngOnChanges(changes);
  }

  toMonths(count: number): string {
    return count === 1
      ? $localize `:@@santander-no-finexp-widget.common.month.one:${count}:count:`
      : $localize `:@@santander-no-finexp-widget.common.month.many:${count}:count:`;
  }

  getCreditFormatted(raw: CreditInterface = null): any {
    raw = raw || this.currentRate?.raw;

    return {
      amount: this.amount,
      amount_with_currency: this.toPrice(this.amount),
      ...raw,
      duration_with_months: this.toMonths(raw?.duration ?? 0),
      monthly_amount_with_currency: this.toPrice(raw?.monthlyAmount ?? 0),
      effective_rate_with_persent: this.toPercent(raw?.effectiveRate ?? 0),
      credit_purchase_with_currency: this.toPrice(raw?.creditPurchase ?? 0),
      credit_price_with_currency: this.toPrice((raw?.creditPurchase ?? 0) - this.amount),
    };
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

    const creditPrice: string = this.toPrice(credit.creditPurchase - this.amount);
    const monthlyAmount: string = this.toPrice(credit.monthlyAmount);
    const twoFieldsListTitle = this.isBNPL ? creditPrice : monthlyAmount;

    return {
      listTitle: this.isTwoFieldsCalculator ? twoFieldsListTitle : line,
      selectedTitle: line,
      selectedMultiTitles: [
        {
          label: translations.rateParams.duration,
          text: this.toMonths(credit.duration),
        },
        this.isBNPL
          ? {
              label: translations.rateParams.creditPrice,
              text: creditPrice,
            }
          : {
              label: translations.rateParams.monthlyAmount,
              text: monthlyAmount,
            },
      ],
      details: [
        {
          title: translations.rateParams.creditPurchaseWithCurrency,
          value: this.toPriceNumber(Math.round(credit.creditPurchase)),
        },
        {
          title: translations.rateParams.creditPriceWithCurrency,
          value: this.toPriceNumber(Math.round(credit.creditPurchase - this.amount)),
        },
        {
          title: translations.rateParams.effectiveRate,
          value: this.toPercent(credit.effectiveRate),
        },
      ],
      value: String(credit.campaignCode),
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

  private translateRate(credit: CreditInterface) {
    const {
      credit_price_with_currency,
      monthly_amount_with_currency,
      duration,
    } = this.getCreditFormatted(credit);

    return {
      bnpl: {
        rateTitle: $localize `:@@santander-no-finexp-widget.bnpl.rate_title:\
        ${credit_price_with_currency}:credit_price_with_currency:\
        ${duration}:duration:`,
        rateParams: {
          duration: $localize `:@@santander-no-finexp-widget.bnpl.rate_param.duration:`,
          creditPrice: $localize `:@@santander-no-finexp-widget.bnpl.rate_param.credit_price:`,
          monthlyAmount: $localize `:@@santander-no-finexp-widget.common.rate_param.monthly_amount:`,
          effectiveRate: $localize `:@@santander-no-finexp-widget.common.rate_param.effective_rate:`,
          creditPurchase: $localize `:@@santander-no-finexp-widget.common.rate_param.credit_purchase:`,
          creditPurchaseWithCurrency: $localize `:@@santander-no-finexp-widget.common.rate_param.credit_purchase_with_currency:`,
          creditPriceWithCurrency: $localize `:@@santander-no-finexp-widget.common.rate_param.credit_price_with_currency:`,
        },
      },
      regular: {
        rateTitle: $localize `:@@santander-no-finexp-widget.regular.rate_title:\
        ${monthly_amount_with_currency}:monthly_amount_with_currency:\
        ${duration}:duration:`,
        rateParams: {
          duration: $localize `:@@santander-no-finexp-widget.regular.rate_param.duration:`,
          monthlyAmount: $localize `:@@santander-no-finexp-widget.regular.rate_param.monthly_amount:`,
          effectiveRate: $localize `:@@santander-no-finexp-widget.regular.rate_param.effective_rate:`,
          creditPurchase: $localize `:@@santander-no-finexp-widget.regular.rate_param.credit_purchase:`,
          creditPrice: $localize `:@@santander-no-finexp-widget.regular.rate_param.credit_price:`,
          creditPurchaseWithCurrency: $localize `:@@santander-no-finexp-widget.regular.rate_param.credit_purchase_with_currency:`,
          creditPriceWithCurrency: $localize `:@@santander-no-finexp-widget.regular.rate_param.credit_price_with_currency:`,
        },
      },
    };
  }
}
