import { PaymentMethodEnum } from '@pe/checkout/types';

export interface CountryPaymentsInterface {
  businessCountry: string,
  paymentMethods: PaymentMethodEnum[]
}

export const ENABLE_PRODUCTS_FOR_COUNTRY: CountryPaymentsInterface[] = [{
  businessCountry: 'GB',
  paymentMethods: [
    PaymentMethodEnum.SANTANDER_INSTALLMENT_UK,
    PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_UK,
  ],
}];
