import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '../enums';

import { SalutationEnum } from './address.interface';
import { BankAccountInterface } from './bank-account.interface';

export interface PaymentCompanyInterface {
  externalId: string;
  homepage?: string;
  name?: string;
  registrationLocation?: string;
  registrationNumber?: string;
  taxId?: string;
  type?: string;
}

export interface PaymentApiCallInterface {
  id?: string;
  failureUrl?: string;
  successUrl?: string;
  pendingUrl?: string;
  cancelUrl?: string;
  shopUrl?: string;
  customerRedirectUrl?: string;

  firstName?: string;
  lastName?: string;
  salutation?: SalutationEnum;
  birthDate?: string; // Example '01.01.1992'
  phone_number?: string;
  zipCode?: string;
  ssn?: string;
  x_frame_host?: string;
  company?: PaymentCompanyInterface;
  skipHandlePaymentFee?: boolean;
}

export interface PaymentInterface {
  amount?: number;
  apiCall?: PaymentApiCallInterface;
  bank_account?: BankAccountInterface;
  callback_url?: string;
  created_at?: string;
  down_payment?: number;
  id?: string;
  notice_url?: string;
  payment_data?: any; // @TODO PaymentDataInterface? Requires specific implementation
  payment_details?: any; // @TODO PaymentDetailsInterface? Requires specific implementation
  payment_flow_id?: string;
  paymentOptionId?: number;
  reference?: string;
  remember_me?: boolean;
  shop_redirect_enabled?: boolean;
  merchant_transaction_link?: string;
  customer_transaction_link?: string;
  specific_status?: PaymentSpecificStatusEnum; // UNIQUE???
  status?: PaymentStatusEnum;
  store_name?: string;
  total?: number;

  // TODO: check types
  flash_bag?: any;
}

export interface PaymentAddressSettingsInterface {
  isPhoneFieldHidden?: boolean;
  phonePattern: string;
  phonePatternCodeRequired: string;
  codeRequired: boolean;
  postalCodePattern: string;
  countryCode: string;
}
