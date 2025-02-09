import { AddressInterface } from '@pe/checkout/types';

export function isAddressFilled(address: AddressInterface): boolean {
  // Address can have empty 'id' for one case - when address is invalid (but was prefilled at store)
  return Boolean(address?.email
    && address?.salutation
    && address?.firstName
    && address?.lastName
    && address?.country
    && address?.city
    && address?.street
    && address?.zipCode);
}
