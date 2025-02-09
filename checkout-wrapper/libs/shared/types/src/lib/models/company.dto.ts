export interface GetCompanyRequestDto {
  company: {
    name: string;
  };
  address: {
    country: string;
  };
}

export interface CompanyAddress {
  city: string;
  countryCode: string;
  postCode: string;
  stateCode: string;
  streetName: string;
  streetNumber: string;
  type: string;
}

export interface GetCompanyResponseDto {
  id: string;
  name: string;
  phoneNumber?: string;
  legalFormCode?: string;
  companyStatus?: string;
  address?: CompanyAddress;
}
