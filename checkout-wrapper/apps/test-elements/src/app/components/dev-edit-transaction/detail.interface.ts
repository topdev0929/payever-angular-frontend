// This file is copypasted from transactions app

import { AddressInterface, PaymentMethodEnum, PaymentSpecificStatusEnum } from '@pe/checkout/types';

export type PaymentType = PaymentMethodEnum;
export type StatusType = PaymentSpecificStatusEnum;

export type SantanderAppSpecificStateType =
  'STATUS_SANTANDER_IN_PROGRESS' | // Santander application state 0
  'STATUS_SANTANDER_IN_PROCESS' | // Santander application state 1
  'STATUS_SANTANDER_DECLINED' | // Santander application state 2
  'STATUS_SANTANDER_APPROVED' | // Santander application state 3
  'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS' | // Santander application state 4
  'STATUS_SANTANDER_DEFERRED' | // Santander application state 5
  'STATUS_SANTANDER_CANCELLED' | // Santander application state 6
  'STATUS_SANTANDER_AUTOMATIC_DECLINE' | // Santander application state 7
  'STATUS_SANTANDER_IN_DECISION' | // Santander application state 8
  'STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY' | // Santander application state 9
  'STATUS_SANTANDER_IN_CANCELLATION' | // Santander application state 10
  'STATUS_SANTANDER_ACCOUNT_OPENED' | // Santander application state 11
  'STATUS_SANTANDER_CANCELLED_ANOTHER' | // Santander application state 12
  'STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED' | // Santander application state 13
  'STATUS_SANTANDER_COMFORT_CARD_ISSUED'; // Santander application state 14

export interface BusinessVatInterface {
  country: string;
  value: number;
}

export interface ActionInterface {
  action: unknown;
  enabled: boolean;
  _label: string;
}

export interface MailActionInterface extends ActionInterface {
  mailEvent?: MailEventInterface;
}

export interface MailEventInterface {
  id: string;
}

export interface RefundItemsInterface {
  count: number;
  payment_item_id: string;
  item_uuid: string;
}

export interface OrderHistoryInterface {
  action: string;
  //// action_translated: string;
  amount: string;
  //// reference: string;
  payment_status: string;
  created_at: string;
  //// payment_status_translated: string;
  // params ?
  reason: string;
  is_items_restocked: boolean;
  // upload_items ?
  refund_items: RefundItemsInterface[];
}

export interface PaymentDetailsInterface {
  // Common
  // delivery_fee?: number | string;
  prefilled?: boolean;

  // Credit cart & Paymill Credit Card
  card_last_digits?: string;
  card_name?: string;
  card_number?: string;
  charge_id?: string;
  cvc?: string;
  exp_month?: string;
  exp_year?: string;
  paymill_payment_id?: string;
  paymill_pre_auth_id?: string;
  token?: string;

  // PayEx Financing Invoice
  accept_conditions?: boolean;
  annual_fee?: string;
  annual_interest?: string;
  application_token?: string;
  applied_amount?: string;
  billing_fee?: string;
  campaign_code?: string;
  contract_sign_bank_i_d_code?: string;
  contract_sign_status_code?: number;
  details_token?: string;
  effective_interest?: string;
  employed_from?: string;
  employed_to?: string;
  employment_type?: string;
  monthly_cost?: string;
  months?: string;
  phone_number?: string;
  social_security_number?: string;
  startup_fee?: string;
  taxable_income?: string;
  total_cost?: string;

  // Santander
  accept_terms_credit_europe?: boolean;
  accept_terms_santander?: string;
  address_cell_phone?: string;
  address_phone?: string;
  address_resident_since?: string;
  // application_number?: string;
  application_status?: string;
  // bank_i_b_a_n?: string;
  click_and_collect?: boolean;
  comfort_card_issued?: boolean;
  comment?: string;
  commodity_group?: string;
  condition?: string;
  condition_name?: string;
  credit_accepts_requests_to_credit_agencies?: boolean;
  credit_calculation?: string;
  credit_confirms_self_initiative?: boolean;
  credit_due_date?: number;
  credit_duration_in_months?: string;
  credit_protection_insurance?: boolean;
  employed_since?: string;
  employed_until?: string;
  employer?: string;
  employment?: number;
  employment_limited?: boolean;
  freelancer?: boolean;
  freelancer_company_name?: string;
  freelancer_employed_since?: string;
  freelancer_industry?: string;
  freelancer_legal_form?: string;
  housing_costs?: string;
  identification_date_of_expiry?: string;
  identification_date_of_issue?: string;
  identification_number?: string;
  identification_place_of_issue?: string;
  income_residence?: string;
  initial_payment?: number;
  monthly_amount?: number;
  monthly_maintenance_payments?: string;
  net_income?: string;
  net_income_partner?: string;
  other_income?: string;
  personal_birth_name?: string;
  personal_date_of_birth?: string;
  personal_marital_status?: string;
  personal_nationality?: string;
  personal_other_nationality?: string;
  personal_place_of_birth?: string;
  personal_residence_permit?: string;
  personal_salutation?: string;
  personal_title?: string;
  prev_address?: boolean;
  prev_address_city?: string;
  prev_address_resident_since?: string;
  prev_address_street_and_number?: string;
  prev_address_zip?: string;
  prev_employed_since?: string;
  prev_employer?: string;
  prev_employment_details?: string;
  rental_income?: string;
  sort_of_income?: string;
  total_credit_amount?: number;
  type_of_identification?: string;
  week_of_delivery?: string;
  _e_u?: number[];

  // Santander POS Installment (DE)
  credit_answer?: string;

}

export interface PaymentDetailsWithOrderInterface extends PaymentDetailsInterface {
  order: {
    finance_id?: string;
    application_no?: string;
    reference?: string;
    usage_text?: string; // Santander Invoice (DE)
    pan_id?: string;
    iban?: string;
  };
}

export interface ItemOptionInterface {
  name: string;
  value: string;
}

export interface ItemInterface {
  uuid: string;
  description: string;
  fixed_shipping_price: number;
  identifier: string;
  item_type: string;
  name: string;
  price: number;
  price_net: number;
  product_variant_uuid: string;
  quantity: number;
  shipping_price: number;
  shipping_settings_rate: number;
  shipping_settings_rate_type: string;
  shipping_type: string;
  thumbnail: string;
  updated_at: string;
  url: string;
  vat_rate: number;
  weight: number;
  created_at: string;
  options?: ItemOptionInterface[];
}

export interface RefundItemInterface {
  item_uuid: string;
  count: number;
}

export interface DetailInterface {
  actions: ActionInterface[];

  transaction: {
    id: string;
    original_id: string;
    uuid: string;
    currency: string;
    amount: number;
    amount_refunded: number;
    amount_rest: number;
    total: number;
    created_at: string;
    updated_at: string;

    example: boolean;
  };
  billing_address: AddressInterface;
  details: PaymentDetailsWithOrderInterface;
  payment_option: {
    id: string,
    type: PaymentType,
    down_payment: number | string;
    payment_fee: number | string;
    fee_accepted: boolean;
  };
  status: {
    general: StatusType;
    specific: SantanderAppSpecificStateType;
    place: string;
    color: string;
  };
  channel_set: {
    uuid: string;
  };
  user: {
    uuid: string;
  };
  business: {
    uuid: string;
  };
  payment_flow: {
    id: string;
  };
  channel: {
    name: string;
    uuid: string;
  };
  customer: {
    email: string;
    name: string;
  };
  history: OrderHistoryInterface[];
  cart: {
    items: ItemInterface[];
    available_refund_items: RefundItemInterface[];
  };
  merchant: {
    email: string;
    name: string;
  };
  shipping: {
    address: AddressInterface;
    category: string;
    method_name: string;
    option_name: string;
    delivery_fee: number | string;
    example_label: string;
    order_id: string;
  };
  store: {
    id: string,
    name: string
  };
}

export interface ActionRequestRefundItemsInterface {
  paymentItemId: string;
  count: number;
}

export interface ActionRequestUpdateDataInterface {
  deliveryFee?: string;
  productLine?: ItemInterface[];
}

export interface ProcessShippingOrderInterface {
  businessName: string;
  transactionId: string;
  transactionDate: string;
  legalText: string;
  billingAddress: ProcessShippingBillingAddressInterface;
  shipmentDate: string; // YYYY-MM-DD
}

export interface ProcessShippingBillingAddressInterface {
  name: string;
  streetName: string;
  streetNumber: string;
  city: string;
  stateProvinceCode: string;
  zipCode: string;
  countryCode: string;
  phone: string;
}
