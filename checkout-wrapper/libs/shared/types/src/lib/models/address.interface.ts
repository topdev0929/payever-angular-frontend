import { AddressTypeEnum } from '../enums';


export enum SalutationEnum {
  SALUTATION_MR = 'SALUTATION_MR',
  SALUTATION_MRS = 'SALUTATION_MRS'
}

interface NodeAddressInterface {
  email?: string;
  city?: string;
  country?: string;
  countryName?: string;
  discr?: string;
  extraPhone?: string;
  fax?: string;
  firstName?: string;
  id?: string | number;
  lastName?: string;
  mobilePhone?: string;
  phone?: string;
  salutation?: SalutationEnum;
  socialSecurityNumber?: string;
  street?: string;
  streetName?: string;
  streetNumber?: string;
  type?: string;
  zipCode?: string;
  apartment?: string;
  stateProvinceCode?: string;
}

export interface AddressInterface extends NodeAddressInterface {
  organizationName?: string;
  email?: string;
  fullAddress?: string;
  id?: string;
  type?: AddressTypeEnum;
  region?: string;
}

export interface AddressSsnInterface {
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  ssn: string;
  streetAddress: string;
  zip: string;
  phoneHome: string;
  phoneWork: string;
  mobilePhone: string;
  email: string;
}
