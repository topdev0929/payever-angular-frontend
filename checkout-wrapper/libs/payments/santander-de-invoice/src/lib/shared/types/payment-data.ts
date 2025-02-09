import { SalutationEnum } from '@pe/checkout/types';

interface FormRatesMainInterface {
  birthday: string;
  phone: string;
  personalSalutation?: SalutationEnum;
  _first_name?: string;
  _last_name?: string;
}

interface FormRatesCheckboxes1Interface {
  conditionsAccepted: boolean;
  advertisingAccepted: boolean;
}

export interface FormInterface {
  formRatesMain?: FormRatesMainInterface;
  formRatesCheckboxes1?: FormRatesCheckboxes1Interface;
  'pe-form-token'?: string;
}

export interface AdditionalPaymentDetailsInterface {
  riskSessionId?: string;
  shopUserSession?: string;
  posVerifyType?: number;
  posMerchantMode?: boolean;
}

export interface NodePaymentDetailsInterface
  extends FormRatesMainInterface,
    FormRatesCheckboxes1Interface,
    AdditionalPaymentDetailsInterface {}
