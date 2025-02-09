import { filterPhoneInput, getPhoneValidationMemoized } from './lib';
import { PhoneInputValidationErrorInterface, PhoneInputValidatorInterface } from './types';

const createPhoneValidationError: (
  country?: boolean,
) => PhoneInputValidationErrorInterface =
  (country = false) => ({
    phone: {
      valid: false,
      country,
    }
  });

// TODO: pass countryControl via BehvaiourSubject or another immediate observable
export const phoneInputValidator: PhoneInputValidatorInterface = ({ countryControl, countryCode, codeRequired } = {}) =>
  ({ value }): PhoneInputValidationErrorInterface | null => {
    if (countryControl && countryControl.value) {
      countryCode = countryControl.value.toLowerCase();
    }

    const filteredValue: string = filterPhoneInput(value);
    if (filteredValue && countryControl && !countryCode) {
      return createPhoneValidationError(true);
    } else {
      const pattern: RegExp = getPhoneValidationMemoized(countryCode, codeRequired) || getPhoneValidationMemoized(null, codeRequired);
      return filteredValue && !pattern.test(filteredValue) ? createPhoneValidationError() : null;
    }
  };
