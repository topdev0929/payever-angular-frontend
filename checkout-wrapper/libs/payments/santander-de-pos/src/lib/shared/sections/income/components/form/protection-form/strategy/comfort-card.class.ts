

import { InsuranceDataInterface } from '../interfaces';

import { AbstractInsuranceStrategyClass } from './abstract.class';

const INTEREST_RATE = '0.89%';

export class ComfortCardStrategyClass extends AbstractInsuranceStrategyClass {

  get insuranceData(): InsuranceDataInterface {
    const interestRate = $localize`:@@payment-santander-de-pos.inquiry.sections.protection.values.interest_rate:${INTEREST_RATE}:value:`;

    return {
      insuranceOptions: [],
      insuranceValue: interestRate,
      dataForwardingRsv: {
        merchant: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.merchant.comfort_dataForwardingRsv:`,
        selfService: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.self_service.comfort_dataForwardingRsv:`,
      },
      informationPackage: {
        merchant: {
          insuranceConditions: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.comfort_insurance_conditions:`,
          productInformationSheet: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.merchant.comfort_product_information_sheet:${this.makeAssetsUrl('IPID_Produktinformationsblatt_CCP_Visa_08_23.pdf')}:fileUrl:`,
        },
        selfService: {
          insuranceConditions: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.comfort_insurance_conditions:`,
          productInformationSheet: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.information_package.self_service.comfort_product_information_sheet:${this.makeAssetsUrl('IPID_Produktinformationsblatt_CCP_Visa_08_23.pdf')}:fileUrl:`,
        },
      },
    };
  }
}
