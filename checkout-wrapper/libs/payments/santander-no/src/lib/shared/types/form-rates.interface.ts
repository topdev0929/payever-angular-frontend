import { ProductTypeEnum } from './enums';

export type RatesPaymentDetails = Omit<RatesFormInterface, 'creditType'>

export interface RatesFormInterface {
  campaignCode: string;
  monthlyAmount: number;
  creditType: ProductTypeEnum;
  socialSecurityNumber: string;
  telephoneMobile: string;
  acceptedCreditCheck: boolean;
}
