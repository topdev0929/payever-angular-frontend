import { Validators } from "@angular/forms";

import { PaymentMethodEnum } from "@pe/checkout-types";

import { ActionTypeEnum, PaymentSecurityCode, VerifyModeEnum } from "../../../../shared";

const ZINIA_VERIFY_CONTROLS: PaymentSecurityCode = {
  name: 'otp_value',
  type: 'string',
  mask: 'AAAAA',
  dropSpecialCharacters: true,
  actions: [ActionTypeEnum.Verify],
  validators: [Validators.required],
  numberOfDigits: 4,
  mode: VerifyModeEnum.Code,
};

export const VERIFY_PAYMENTS_CONTROLS: { [key: string]: PaymentSecurityCode } = {
  [PaymentMethodEnum.ZINIA_POS_DE]: ZINIA_VERIFY_CONTROLS,
  [PaymentMethodEnum.ZINIA_POS]: ZINIA_VERIFY_CONTROLS,
  [PaymentMethodEnum.ZINIA_BNPL_DE]: ZINIA_VERIFY_CONTROLS,
  [PaymentMethodEnum.ZINIA_POS_INSTALLMENT_DE]: ZINIA_VERIFY_CONTROLS,
  [PaymentMethodEnum.ZINIA_POS_INSTALLMENT]: ZINIA_VERIFY_CONTROLS,
  [PaymentMethodEnum.ZINIA_POS_SLICE_THREE_DE]: ZINIA_VERIFY_CONTROLS,
  [PaymentMethodEnum.ZINIA_POS_SLICE_THREE]: ZINIA_VERIFY_CONTROLS,
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
    name: 'idNumber',
    type: 'string',
    mask: 'BBBBB',
    patterns: {
      'B': { pattern: new RegExp('[a-zA-Z0-9./-]') },
    },
    dropSpecialCharacters: false,
    actions: [ActionTypeEnum.Verify],
    validators: [Validators.required, Validators.minLength(5)],
    mode: VerifyModeEnum.ById,
  },
  code: {
    name: 'code',
    type: 'string',
    mask: 'AAAAAA',
    dropSpecialCharacters: true,
    actions: [ActionTypeEnum.Verify],
    validators: [Validators.required, Validators.minLength(6)],
    numberOfDigits: 6,
    mode: VerifyModeEnum.Code,
  },
};
