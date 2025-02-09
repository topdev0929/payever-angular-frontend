
export interface CompanyAddressInterface {
  city: string;
  countryCode: string;
  postCode: string;
  stateCode: string;
  streetName: string;
  streetNumber: string;
  type: string;
}

export interface CompanyInterface {
  id: string;
  name: string;
  phoneNumber?: string;
  legalFormCode?: string;
  companyStatus?: string;
  address?: CompanyAddressInterface;
}
