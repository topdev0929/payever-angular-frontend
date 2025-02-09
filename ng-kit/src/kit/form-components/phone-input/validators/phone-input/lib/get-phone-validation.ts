import { memoize } from 'lodash-es';

import { PhoneInputValidationInterface } from '../types';
import { PHONE_INPUT_VALIDATIONS } from '../constants';

function getPhoneValidation(countryCode: string, codeRequired: boolean): RegExp | null {
  let found: PhoneInputValidationInterface;

  if (!countryCode) {
    found = PHONE_INPUT_VALIDATIONS.find(
      ({ defaultValidator }) => defaultValidator
    );
  } else {
    found = PHONE_INPUT_VALIDATIONS.find(
      ({ countryCodes }) => countryCodes && countryCodes.includes(countryCode)
    );
  }

  return found ? (codeRequired ? found.patternCodeRequired : found.patternDefault) : null;
}

export const getPhoneValidationMemoized: (countryCode: string, codeRequired: boolean) => RegExp | null =
  memoize(getPhoneValidation);
