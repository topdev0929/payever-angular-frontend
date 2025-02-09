import { PaymentMethodEnum, PaymentSpecificStatusEnum, PaymentStatusEnum } from '../enums';

import { AddressInterface } from './address.interface';

export interface DetailsTransactionInterface {
  id: string;
  original_id: string;
  uuid: string;
  currency: string;
  amount: number;
  amount_refunded: number;
  amount_rest: number;
  amount_left: number;
  amount_refund_rest: number;
  amount_capture_rest: number;
  total: number;
  total_left: number;
  created_at: string;
  updated_at: string;

  example: boolean;
}

export interface DetailsStatusInterface {
  general: PaymentStatusEnum;
  specific: PaymentSpecificStatusEnum;
}

export interface PaymentDetailsWithOrderInterface {
  // Common
  // delivery_fee?: number | string;
  prefilled?: boolean;

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
  // guarantor_type?: GuarantorTypeEnum;
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
  pos_verify_type?: number;
  posVerifyType?: number;
  week_of_delivery?: string;
  _e_u?: number[];

  // Santander POS Installment (DE)
  credit_answer?: string;
  order: {
    finance_id?: string;
    application_no?: string;
    reference?: string;
    usage_text?: string; // Santander Invoice (DE)
    pan_id?: string;
    iban?: string;
  };
}

export interface TransactionDetailInterface {
  // actions: ActionInterface[];

  transaction: DetailsTransactionInterface;
  billingAddress: AddressInterface;
  details: PaymentDetailsWithOrderInterface;
  payment_option: {
    id: string;
    type: PaymentMethodEnum;
    down_payment: number | string;
    payment_fee: number | string;
    fee_accepted: boolean;
  };
  status: DetailsStatusInterface;
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
  // history: OrderHistoryInterface[];
  // cart: {
  //   items: ItemInterface[];
  //   available_refund_items: RefundItemInterface[];
  // };
  merchant: {
    email: string;
    name: string;
  };
  seller: {
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
