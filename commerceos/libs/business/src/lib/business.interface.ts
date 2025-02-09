import { AppThemeEnum, UserTypeBusinessEnum } from "@pe/common";

export interface BusinessAccessOptionsInterface {
  hasAccess: boolean;
  userTypeBusiness?: UserTypeBusinessEnum;
}

export interface BankAccount {
  bankName: string;
  bic: string;
  city: string;
  country: string;
  createdAt: string;
  iban: string;
  owner: string;
  updatedAt: string;
  _id: string;
}

export interface CompanyAddress {
  city: string;
  country: string;
  createdAt: string;
  street: string;
  updatedAt: string;
  zipCode: string;
  _id: string;
}

export interface CompanyDetails {
  createdAt: string;
  foundationYear: string;
  industry: string;
  legalForm: string;
  product: string;
  updatedAt: string;
  urlWebsite: string;
  _id: string;
}

export interface ContactDetails {
  additionalPhone: string;
  createdAt: string;
  fax: string;
  firstName: string;
  lastName: string;
  phone: string;
  salutation: string;
  updatedAt: string;
  _id: string;
}

export interface BusinessDocuments {
  commercialRegisterExcerptFilename: string;
  createdAt: string;
  updatedAt: string;
  _id: string;
}

export interface BusinessWallpaper {
  theme: AppThemeEnum;
  _id: string;
  auto: boolean;
  wallpaper: string;
}

export interface BusinessTaxes {
  companyRegisterNumber: string;
  createdAt: string;
  taxId: string;
  taxNumber: string;
  turnoverTaxAct: boolean;
  updatedAt: string;
  _id: string;
}

export interface BusinessThemeSettingsColors {
  _id?: string;
  theme: AppThemeEnum;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface BusinessThemeSettingsTheme {
  theme: AppThemeEnum;
  _id?: string;
  auto?: boolean;
}

export interface BusinessThemeSettings extends BusinessThemeSettingsColors, BusinessThemeSettingsTheme {
}

export interface BusinessInterface {
  active: boolean;
  bankAccount: BankAccount;
  companyAddress: CompanyAddress;
  companyDetails: CompanyDetails;
  contactDetails: ContactDetails;
  contactEmails: [];
  createdAt: string;
  cspAllowedHosts: [];
  currency: string;
  industry?: string;
  currentWallpaper: BusinessWallpaper;
  defaultLanguage: string;
  documents: BusinessDocuments;
  hidden: boolean;
  logo: string;
  name: string;
  owner: string;
  taxes: BusinessTaxes;
  themeSettings: BusinessThemeSettings;
  updatedAt: string;
  _id: string;
  uuid?: string;
  email?: string;
}

export interface UpdateBusinessInterface extends Partial<Omit<BusinessInterface,'themeSettings'>> {
  themeSettings: BusinessThemeSettingsColors | BusinessThemeSettingsTheme | BusinessThemeSettings;
}

export interface SettingsBusinessInterface {
  _id: string;
  active?: boolean;
  city: string;
  country: string;
  hidden: string;
  legalForm: string;
  name: string;
  phone: string;
  street: string;
  zipCode: string;
  logo?: string;
  companyAddress?: {
    country: string;
    city: string;
  };
  contactDetails?: any;
  email?: string;
  themeSettings?: any;
}

export interface BusinessListInterface {
  businesses: BusinessInterface[];
  total: number;
}
