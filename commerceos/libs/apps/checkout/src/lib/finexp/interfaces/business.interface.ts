export interface BusinessInterface {
  _id: string;
  name: string;
  active: boolean;
  currency: string;
  companyAddress: {
    country: string;
  };
}

export interface UserBusinessInterface {
  _id: string;
  name: string;
  active: boolean;
  currency: string;
}
