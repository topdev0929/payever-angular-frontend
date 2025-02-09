import { FormOptionInterface } from '@pe/checkout/types';

export interface FormOptionsInterface {
  isAmlEnabled: boolean;
  paySources: FormOptionInterface[];
  professionalStatuses: FormOptionInterface[];
  maritalStatuses: FormOptionInterface[];
  residentialStatuses: FormOptionInterface[];
}
