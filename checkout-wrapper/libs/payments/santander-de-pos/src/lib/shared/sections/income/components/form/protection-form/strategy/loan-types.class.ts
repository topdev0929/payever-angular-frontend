import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ParamsState } from '@pe/checkout/store';

import { InsuranceDataInterface } from '../interfaces';

import { AbstractInsuranceStrategyClass } from './abstract.class';

export class LoanTypesStrategyClass extends AbstractInsuranceStrategyClass {
  @SelectSnapshot(ParamsState.merchantMode) private merchantMode!: boolean;

  private get desiredInstalment() {
    return this.paymentForm?.ratesForm?.desiredInstalment;
  }

  get insuranceData(): InsuranceDataInterface {
    const month = $localize`:@@payment-santander-de-pos.creditRates.month:`;
    const insuranceValue = this.toPrice(
      this.cpiRate?.monthlyPayment - this.rate?.monthlyPayment,
    );

    const monthlyInstalment = $localize`:@@payment-santander-de-pos.inquiry.sections.protection.options.monthly_installments:${this.toPrice(this.cpiRate?.monthlyPayment)}:newValue:${this.toPrice(this.rate?.monthlyPayment)}:oldValue:`;
    const totalLoan = $localize`:@@payment-santander-de-pos.inquiry.sections.protection.options.total_loan:${this.toPrice(this.cpiRate?.totalCreditCost)}:newValue:${this.toPrice(this.rate?.totalCreditCost)}:oldValue:`;
    const lastInstallment = $localize`:@@payment-santander-de-pos.inquiry.sections.protection.options.last_installment:${this.toPrice(this.cpiRate?.lastMonthPayment)}:newValue:${this.toPrice(this.rate?.lastMonthPayment)}:oldValue:`;

    return {
      insuranceOptions: this.merchantMode
        ? []
        : [
          monthlyInstalment,
          totalLoan,
          lastInstallment,
        ],
      insuranceValue: this.desiredInstalment ? this.toPrice(this.cpiRate?.specificData?.rsvTotal) : `${insuranceValue}/${month}`,
      dataForwardingRsv: {
        merchant: $localize `:@@payment-santander-de-pos.inquiry.sections.protection.merchant.dataForwardingRsv:`,
        selfService: $localize `:@@payment-santander-de-pos.inquiry.sections.protection.self_service.dataForwardingRsv:`,
      },
      informationPackage: {
        merchant: {
          insuranceConditions: $localize `:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.insurance_conditions:`,
          productInformationSheet: $localize `:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.product_information_sheet:${this.makeAssetsUrl('Produktinformationsblatt_RSV_Plus_Durables.pdf')}:fileUrl:`,
        },
        selfService: {
          insuranceConditions: $localize `:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.insurance_conditions:`,
          productInformationSheet: $localize `:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.product_information_sheet:${this.makeAssetsUrl('Produktinformationsblatt_RSV_Plus_Durables.pdf')}:fileUrl:`,
        },
      },
    };
  }
}
