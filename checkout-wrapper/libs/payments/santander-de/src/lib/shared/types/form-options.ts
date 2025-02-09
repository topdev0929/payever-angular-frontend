import { FormOptionInterface } from '@pe/checkout/types';

export interface BaseFormOptionsInterface {
  commodityGroups: FormOptionInterface[];
  professions: FormOptionInterface[];
  isDownPaymentAllowed: boolean;
  maritalStatuses: FormOptionInterface[];
  nationalities: FormOptionInterface[];
  residentialTypes: FormOptionInterface[];
  guarantorRelations: FormOptionInterface[];
  identifications: FormOptionInterface[];
}

export interface FormOptionsInterface extends BaseFormOptionsInterface {
  condition?: FormOptionInterface[];
}

