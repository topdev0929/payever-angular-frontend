import { AddressFormValue } from '../types';

export function mapGuarantorAddress(address: AddressFormValue) {
  if (!address) {
    return null;
  }

  return {
    contactEmail: address.email,
    addressSalutation: address.salutation,
    addressFirstName: address.firstName,
    addressLastName: address.lastName,
    addressCountry: address.country,
    addressCity: address.city,
    addressStreet: address.street,
    addressStreetNumber: address.streetNumber,
    addressZip: address.zipCode,
    _full_address: address.fullAddress,
  };
}

export function mapAddress(address: any): AddressFormValue {
  if (!address) {
    return null;
  }

  return {
    email: address.contactEmail,
    salutation: address.addressSalutation,
    firstName: address.addressFirstName,
    lastName: address.addressLastName,
    country: address.addressCountry,
    city: address.addressCity,
    street: address.addressStreet,
    streetName: address.addressStreet,
    streetNumber: address.addressStreetNumber,
    zipCode: address.addressZip,
    fullAddress: address._full_address,
  };
}
