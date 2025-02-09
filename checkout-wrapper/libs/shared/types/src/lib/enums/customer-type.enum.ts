import { BusinessType } from './business-type.enum';
import { PaymentMethodEnum } from './payment-method.enum';

export enum CustomerType {
  Person = 'person',
  Organization = 'organization',
}

export const CUSTOMER_TYPE_I18N: Record<CustomerType, string> = {
  [CustomerType.Organization]: $localize`:@@checkout_address_edit.form.business_type.b2b:Commercial`,
  [CustomerType.Person]: $localize`:@@checkout_address_edit.form.business_type.b2c:Private`,
};

export const P2P_PAYMENTS = [
  PaymentMethodEnum.ALLIANZ,
  PaymentMethodEnum.BFS_B2B_BNPL,
];

export const BusinessToCustomerMap: {
  [key in BusinessType]?: CustomerType;
} = {
  [BusinessType.B2C]: CustomerType.Person,
  [BusinessType.B2B]: CustomerType.Organization,
};
