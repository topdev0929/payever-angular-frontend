import { InsuranceDataInterface } from '../interfaces';

import { AbstractInsuranceStrategyClass } from './abstract.class';

export class LoanTypesStrategyClass extends AbstractInsuranceStrategyClass {
  get insuranceData(): InsuranceDataInterface {
    const month = $localize`:@@payment-santander-de-pos.creditRates.month:`;
    const insuranceValue = this.toPrice(
      this.cpiRate?.monthlyPayment - this.rate?.monthlyPayment,
    );

    const insuranceFootnote = $localize`:@@santander-de.inquiry.protection.footnote:${this.toPrice(this.cpiRate?.monthlyPayment)}:new_monthly_installments:${this.toPrice(this.rate?.monthlyPayment)}:previous_monthly_installments:${this.toPrice(this.cpiRate?.totalCreditCost)}:new_amount:${this.toPrice(this.rate?.totalCreditCost)}:previous_amount:`;

    return {
      insuranceFootnote,
      insuranceValue: `${insuranceValue}/${month}`,
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
