import { PaymentMethodEnum } from '@pe/checkout/types';

import { PaymentEditConfig } from '../models';

import { SANTANDER_DE_POS_VARIANT_CONFIG } from './variants';

type PaymentEditConfigMap = {
  [Key in PaymentMethodEnum]?: PaymentEditConfig;
}

export const PAYMENT_EDIT_CONFIG_MAP: PaymentEditConfigMap = {
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: SANTANDER_DE_POS_VARIANT_CONFIG,
};
