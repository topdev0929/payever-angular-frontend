import { SalutationEnum } from '@pe/checkout/types';

export interface FormRatesMainInterface {
  duration?: number;
  birthday?: string | Date;
  phone: string;
  personalSalutation?: SalutationEnum;
  _firstName?: string;
  _lastName?: string;

  totalCreditCost: number;
  interestRate: number;
  monthlyPayment: number;
  lastMonthPayment: number;
}

export interface FormRatesCheckboxes1Interface {
  conditionsAccepted?: boolean;
  advertisingAccepted?: boolean;
}

export interface FormRatesDataInterface {
  contractPdfUrl?: string;
  initializeUniqueId?: string;
  annualPercentageRate?: string;
}

export class FormInterface {
  formRatesMain?: FormRatesMainInterface;
  formRatesCheckboxes1?: FormRatesCheckboxes1Interface;
  formRatesData?: FormRatesDataInterface;
  'pe-form-token'?: string;
}
