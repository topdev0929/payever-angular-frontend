import { isDevMode } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { getCountries, getCountryCallingCode, parsePhoneNumber as _parsePhoneNumber } from 'libphonenumber-js/max';
import { CountryCode, NumberType, PhoneNumber } from 'libphonenumber-js/types';

const COUNTRY_CODES = [
  'DE', 'SE', 'NO', 'DK', 'SV', 'SE', 'ES', 'US', 'GB',
  ...getCountries(),
] as CountryCode[];

export class PhoneValidators {

  static codeRequired(
    country?: CountryCode | CountryCode[],
  ): (control: AbstractControl) => ValidationErrors {
    return (control: AbstractControl): ValidationErrors => {
      if (!control.value) {
        return null;
      }

      let startsWithCodes: CountryCode[] = [];

      if (Array.isArray(country)) {
        startsWithCodes = country;
      } else if (country) {
        startsWithCodes.push(country);
      } else {
        startsWithCodes = COUNTRY_CODES;
      }

      const countryCallingCodes = startsWithCodes.map(code => getCountryCallingCode(code));
      const countryCodes = countryCallingCodes.map(code => `+${code}`);

      if (countryCodes?.every(code => !control.value.trim().startsWith(code))) {
        const error = countryCallingCodes && country
          ? $localize`:@@ng_kit.forms.error.validator.phone_number.country_code_required:${countryCodes.join(', ')}:code:`
          : $localize`:@@ng_kit.forms.error.validator.phone_number.country_any_code_required:`;

        return { codeRequired: error };
      }

      return null;
    };
  }

  static country(
    country: CountryCode | CountryCode[],
    controlName?: string,
  ): (control: AbstractControl) => ValidationErrors {
    return (control: AbstractControl): ValidationErrors => {
      if (!control.value) {
        return null;
      }

      let countryMatch: CountryCode;
      if (Array.isArray(country)) {
        countryMatch = country.find((country) => {
          const phone = this.parsePhone(control.value, country);

          return phone?.isValid() && (phone.country === country || !phone.country);
        });
      } else {
        countryMatch = country;
      }
      const phone = this.parsePhone(control.value, countryMatch);
      if (!phone) {
        return { phone: $localize `:@@ng_kit.forms.error.validator.phone_number.invalid:${controlName}:fieldName:` };
      }
      const parsedPhone = phone.isValid() && phone;

      if (!parsedPhone) {
        return { phone: $localize `:@@ng_kit.forms.error.validator.phone_number.invalid:${controlName}:fieldName:` };
      }

      const countryCode = parsedPhone?.countryCallingCode || getCountryCallingCode(countryMatch);

      if (countryCode) {
        const regex = new RegExp(`^(\\+${countryCode}[0]+)`, 'gi');

        if (control.value.match(regex)) {
          return { phone: $localize `:@@ng_kit.forms.error.validator.phone_number.no_zeros:${controlName}:fieldName:` };
        }
      }

      if (countryMatch !== parsedPhone?.country) {
        return { phone: $localize `:@@ng_kit.forms.error.validator.phone_number.invalid_for_country:${controlName}:fieldName:` };
      }

      return null;
    };
  }

  static type(
    target: NumberType,
    country?: CountryCode,
    controlName?: string,
  ): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }

      const phone = this.parsePhone(control.value, country);
      if (!phone) {
        return { phone: $localize`:@@ng_kit.forms.error.validator.phone_number.invalid:${controlName}:fieldName:` };
      }

      if (phone.getType() !== target) {
        const error = target === 'MOBILE'
          ? $localize`:@@ng_kit.forms.error.validator.phone_number.only_mobile_allowed:${controlName || 'phone'}:fieldName:`
          : $localize`:@@ng_kit.forms.error.validator.phone_number.only_landline_allowed:${controlName || 'phone'}:fieldName:`;

        return { phone: error };
      }

      return null;
    };
  }

  public static parsePhone(value: string, country?: CountryCode): PhoneNumber {
    const parsed = parsePhoneNumber(value, country);

    return parsed?.isValid()
      ? parsed
      : this.getPhoneNumber(value);
  }

  private static getPhoneNumber(value: string): PhoneNumber {
    const country = COUNTRY_CODES.find(country => parsePhoneNumber(value, country)?.isValid());

    return parsePhoneNumber(value, country);
  }
}

function parsePhoneNumber(...args: Parameters<typeof _parsePhoneNumber>): PhoneNumber | null {
  try {
    return _parsePhoneNumber(...args);
  } catch (error) {
    // eslint-disable-next-line no-console
    if (isDevMode()) { console.warn(error) }
  }

  return null;
}
