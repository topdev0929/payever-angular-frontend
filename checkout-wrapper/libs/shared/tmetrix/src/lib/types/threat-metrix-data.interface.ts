export interface ThreatMetrixDataInterface {
  account_email?: string;
  account_first_name?: string;
  account_last_name?: string;
  account_date_of_birth?: string;
  transaction_id?: string;
  transaction_amount?: number;
  account_telephone?: string;
  condition_attrib_1?: string; // webshop identifier
  condition_attrib_2?: string; // webshop type: api, shopify, woocommerce, etc.
  condition_attrib_3?: string; // Environment
  condition_attrib_4?: string; // Customer since
  condition_attrib_5?: string; // reversal flag
  custom_count_1?: string; // Customer order count
  custom_count_2?: string; // Shipping address same as account address
  custom_count_3?: string; // installment frequency
  local_attrib_1?: string; // basket_id
  local_attrib_2?: string; // shopper_id
  unencrypted_condition_attrib_1?: string; // webshop identifier
  unencrypted_condition_attrib_2?: string; // User agent header
  session_id: string; // risk session id
}
