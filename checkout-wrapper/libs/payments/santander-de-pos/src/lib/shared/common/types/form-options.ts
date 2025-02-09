import { FormOptionInterface } from '@pe/checkout/types';

export interface ConditionProgramInterface {
  key: string;
  program: string;
}

export interface ConditionInterface {
  description: string;
  programs: ConditionProgramInterface[];
  isComfortCardCondition: boolean;
}

export interface FormOptionsInterface {
  // For steps 1
  commodityGroups: FormOptionInterface[];
  conditions: ConditionInterface[];
  professions: FormOptionInterface[];
  isDownPaymentAllowed: boolean;
  defaultCondition: string;
  // For steps 2-3
  nationalities: FormOptionInterface[];
  maritalStatuses: FormOptionInterface[];
  guarantorRelations: FormOptionInterface[];
  identifications: FormOptionInterface[];
  residentialTypes: FormOptionInterface[];
}
