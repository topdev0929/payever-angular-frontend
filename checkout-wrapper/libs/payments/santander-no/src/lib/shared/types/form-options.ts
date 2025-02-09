import { FormOptionInterface } from '@pe/checkout/types';

export interface FormOptionsInterface {
  isAmlEnabled: boolean;
  maritalStatuses: FormOptionInterface[];
  paySources: FormOptionInterface[];
  professionalStatuses: FormOptionInterface[];
  residentialStatuses: FormOptionInterface[];
}
