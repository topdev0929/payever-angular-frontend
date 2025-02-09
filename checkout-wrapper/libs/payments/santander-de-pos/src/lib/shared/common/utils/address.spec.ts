import { AddressFormValue } from '../types';

import { mapAddress, mapGuarantorAddress } from './address';

const address: AddressFormValue = {
  city: 'Koln',
  country: 'DE',
  email: 'test@payever.org',
  firstName: 'Test',
  fullAddress: '12 Test St, Koln, DE',
  lastName: 'Test',
  salutation: 'Mr.',
  street: 'Test St',
  streetName: 'Test St',
  streetNumber: '12',
  zipCode: '55555',
};

const guarantorAddress = {
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

describe('mapGuarantorAddress', () => {
  it('should return null if address is null', () => {
    expect(mapGuarantorAddress(null)).toBeNull();
  });

  it('should map address fields correctly', () => {
    expect(mapGuarantorAddress(address)).toEqual(guarantorAddress);
  });
});

describe('mapAddress', () => {
  it('should return null if address is null', () => {
    expect(mapAddress(null)).toBeNull();
  });

  it('should map address fields correctly', () => {
    expect(mapAddress(guarantorAddress)).toEqual(address);
  });
});
