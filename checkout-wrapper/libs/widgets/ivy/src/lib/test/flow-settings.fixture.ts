import { CheckoutSettingsInterface, SectionType } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

export const flowSettingsFixture: () => CheckoutSettingsInterface = () => cloneDeep<CheckoutSettingsInterface>({
  uuid: 'uuid-12345',
  sections: [{
    code: SectionType.ChoosePayment,
    fixed: false,
    enabled: true,
    order: 1231,
    allowed_only_channels: [],
    excluded_channels: [],
  }],
  styles: null,
  logo: 'https://cdn.payever.org/logo-ivy.jpg',
});
