import { AddressInterface } from '../../address';

interface BankAccountInterface {
  account_number: string;
  bank_code?: string;
  bank_name: string;
  bic?: string;
  city: string;
  country: string;
  iban?: string;
  id: string;
  owner: string;
  routing_number?: string;
}

interface ShippingAddressesInterface extends AddressInterface {
  email: null;
  order_ids: string[];
  orders: string[];
  orders_count: number;
}

export interface ProfileInterface {
  avatar_url: string;
  bank_account: BankAccountInterface;
  birthday: string;
  billing_address: AddressInterface;
  email: string;
  id: string;
  shipping_addresses: ShippingAddressesInterface[];
}

export interface ProfileSettingsInterface {
  avatar: string;
  birthday: string;
  confirmation_token: string;
  created_at: string;
  default_language: string;
  email: string;
  enabled: boolean;
  expired: boolean;
  expires_at: string;
  first_name: string;
  id: number;
  last_name: string;
  marketing_source: string;
  profile_id: string;
  registration_completed: boolean;
  registration_source: string;
  roles: string[];
  updated_at: string;
  uuid: string;
}
