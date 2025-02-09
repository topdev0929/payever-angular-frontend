import { FormOptionInterface } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

export const formOptionFixture: () => FormOptionInterface = () => cloneDeep<FormOptionInterface>({
  value: 'form_option_fixture_value',
  label: 'form_option_fixture_label',
});
