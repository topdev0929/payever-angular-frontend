export interface AddressFormInterface {
  id?: number;
  city?: string;
  country?: string;
  organizationName?: string;
  email?: string;
  firstName?: string;
  fullAddress?: string;
  lastName?: string;
  phone?: number;
  salutation?: string;
  street?: string;
  streetName?: string; // Hidden
  streetNumber?: string; // Hidden
  select_address?: string;
  socialSecurityNumber?: string;
  zipCode?: string;
}


export type DisableAddressFormFieldsType = {
  [key in keyof AddressFormInterface]?: boolean;
}

export interface DisabledAddressFieldsFoCountryInterface {
  [countryCode: string]: DisableAddressFormFieldsType;
}
