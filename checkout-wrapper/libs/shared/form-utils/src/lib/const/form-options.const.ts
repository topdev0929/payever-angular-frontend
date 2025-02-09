import { FormOptionInterface } from '@pe/checkout/types';

export const YesNoOptions: FormOptionInterface[] = [{
  label: $localize`:@@options.boolean.no:`,
  value: false,
}, {
  label: $localize`:@@options.boolean.yes:`,
  value: true,
}];
