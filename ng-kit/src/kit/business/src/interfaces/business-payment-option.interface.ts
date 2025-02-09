export interface BusinessPaymentOptionInterface {
  contract_length: number;
  description_fee: string;
  description_offer: string;
  fixed_fee: number;
  id: number;
  info_url: string;
  instruction_text: string;
  max: number;
  merchant_allowed_countries: string[];
  min: number;
  name: string;
  payment_method: string;
  related_country: string[];
  slug: string;
  status: string;
  thumbnail1: string;
  thumbnail2: string;
  variable_fee: number;
}
