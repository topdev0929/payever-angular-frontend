import { FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';

import { phoneInputValidator } from './phone-input.validator';
import { getLangList } from '../../../../i18n';

interface PhoneNumbersPreset {
  [countryCode: string]: string[];
}

describe('phoneInputValidator', () => {
  let countryControl: FormControl;
  let phoneInputControl: FormControl;
  let validator: ValidatorFn;

  const countryList: string[] = Object.keys(getLangList());

  enum TestCountryCodes {
    England = 'en',
    Germany = 'de',
    Sweden = 'sv',
    Norway = 'no',
    Spain = 'es',
    Denmark = 'da',
  }

  // NOTE: most phones picked from Google Maps addresses
  const validPhoneNumbers: PhoneNumbersPreset = {
    [TestCountryCodes.England]: [
      '+44 20 7589 8212',
      '+44 20 7638 4141',
      '(0161) 832-6565',
      '0161 751 1412',
      '+44 131-510-7555',
      '+44 131 667 2743',
      '(+44) 1463 237166',
      '028 9076 6386',
      '0191 2578877',
      '07940 723998',
      '+44 28 9093 9093',
    ],
    [TestCountryCodes.Germany]: [
      '039999-19864',
      '09238-654477',
      '01798-438280',
      '0228-5025954',
      '+49 40 32527414',
      '+49 40 032527414',
      '+49 40-32527414',
      '(+49) 40 325274140',
      '04032527414',
      '0403 25274140',
      '030 25002333',
      '+49 30 24047022',
    ],
    [TestCountryCodes.Sweden]: [
      '+46 850828508',
      '+46 850-828 508',
      '+46 73 435 36 56',
      '040 38 37 62',
      '0850828508',
      '+46 474 202 00',
      '0474 202 00',
      '+46 850828508',
      '0500-7944663',
      '0171-7409262',
      '054-9545246',
    ],
    [TestCountryCodes.Norway]: [
      '+47 20 61 43 23',
      '020 61 43 65',
      '+47 911 71 946',
      '966 66 206',
      '415 87 163',
      '(067) 85 000',
      '(04) 66 00 00',
      '+47 75 12 05 00',
      '075-12-05-00',
    ],
    [TestCountryCodes.Denmark]: [
      '+45 33 18 56 56',
      '70 10 60 70',
      '(+45) 76-30-05-30',
      '21-74-17638',
      '51-47-28557',
      '+45 36 70 99 44',
      '37-80-5434-4353',
      '+45 37-80-5434-4353',

      '+298 313900', // Faror Islands
      '341900',

      '+298 333999', // Greenland
      '+299 58 14 02',
      '58 14 02',
    ],
    [TestCountryCodes.Spain]: [
      '+34 914 47 21 00',
      '+34 956 76 71 39',
      '+34 685 41 73 31',
      '741 610 526',
      '633 104 953',
      '619 595 869',
      '941 25 13 00',
      '624 076 694',

      '+350 200 61221', // Gibraltar
    ],
  };

  const alwaysInvalidPhoneNumbers: string[] = [
    '911',
    '112',
    '666'
  ];

  describe('with countryControl', () => {
    beforeEach(() => {
      countryControl = new FormControl();
      phoneInputControl = new FormControl();
      validator = phoneInputValidator({ countryControl });
    });

    it('self-test', () => {
      expect(countryList.length).toBeGreaterThan(0);
    });

    countryList.forEach(countryCode => {
      describe(`with valid phone numbers for ${countryCode}`, () => {
        beforeEach(() => {
          countryControl.setValue(countryCode);
        });

        it(`should validate "${countryCode}" locale phone numbers`, () => {
          const preset: string[] = validPhoneNumbers[countryCode];
          expect(preset).toBeTruthy();
          expect(preset.length).toBeGreaterThan(0);

          preset.forEach(phoneNumber => {
            phoneInputControl.setValue(phoneNumber);
            const result: ValidationErrors = validator(phoneInputControl);
            expect(result).toBeFalsy(`phone number "${phoneNumber}" should be VALID`);
          });
        });

        it(`should be invalid for other country rather than "${countryCode}", with country-code matching`, () => {
          const leadingPlus: RegExp = /^\+/;
          const otherCountriesNumbers: string[] = Object.keys(validPhoneNumbers)
            .filter(code => code && code !== countryCode)
            .map(code => validPhoneNumbers[code])
            .reduce((allNumbers, codes) => allNumbers.concat(codes), [])
            .filter(number => number.match(leadingPlus));

          expect(otherCountriesNumbers.length).toBeGreaterThan(0);

          otherCountriesNumbers.forEach(phoneNumber => {
            phoneInputControl.setValue(phoneNumber);
            const result: ValidationErrors = validator(phoneInputControl);
            expect(result).toBeTruthy(`phone "${phoneNumber}" should NOT be valid for "${countryCode}"`);
          });
        });

        it('should not pass always invalid numbers', () => {
          alwaysInvalidPhoneNumbers.forEach(phoneNumber => {
            phoneInputControl.setValue(phoneNumber);
            const result: ValidationErrors = validator(phoneInputControl);
            expect(result)
              .toEqual(
                { phone: { country: false, valid: false } },
                `phone "${phoneNumber}" should NOT be valid`
              );
          });
        });
      });
    });

    it('should be invalid if country didnt passed', () => {
      countryControl.setValue('');
      phoneInputControl.setValue(validPhoneNumbers[TestCountryCodes.England][0]);
      const result: ValidationErrors = validator(phoneInputControl);
      expect(result)
        .toEqual(
          { phone: { country: true, valid: false } },
          '"country: true" should be flagged'
        );
    });

    it('should be valid if value didnt passed and country selected', () => {
      countryControl.setValue(TestCountryCodes.England);
      phoneInputControl.setValue('');
      const result: ValidationErrors = validator(phoneInputControl);
      expect(result).toEqual(null);
    });

    it('should be valid if value didnt passed and country is empty', () => {
      countryControl.setValue('');
      phoneInputControl.setValue('');
      const result: ValidationErrors = validator(phoneInputControl);
      expect(result).toEqual(null);
    });

    it('should return error for unknown country code', () => {
      countryControl.setValue('[AN_UNKNOWN_COUNTRY_CODE]');

      const phoneNumbers: string[] = Object.keys(validPhoneNumbers)
        .map(code => validPhoneNumbers[code][0]);
      expect(phoneNumbers.length).toBeGreaterThan(0, 'self-test');

      phoneNumbers.forEach(phoneNumber => {
        phoneInputControl.setValue(phoneNumber);
        const result: ValidationErrors = validator(phoneInputControl);
        expect(result)
          .toBeFalsy(`phone "${phoneNumber}" should be validated with default validator`);
      });
    });
  });

  describe('without countryControl', () => {
    beforeEach(() => {
      phoneInputControl = new FormControl();
      validator = phoneInputValidator();
    });

    it('should be valid for empty value', () => {
      phoneInputControl.setValue('');
      const result: ValidationErrors = validator(phoneInputControl);
      expect(result).toEqual(null);
    });

    it('should be valid for valid filled value', () => {
      const numbers: string[] = Object.keys(validPhoneNumbers)
        .reduce(
          (nums, code) => nums.concat(validPhoneNumbers[code]),
          []
        );

      expect(numbers).toBeTruthy('self-check');
      expect(numbers.length).toBeGreaterThan(0, 'self-check');

      numbers.forEach(number => {
        phoneInputControl.setValue(number);
        const result: ValidationErrors = validator(phoneInputControl);
        expect(result).toBeFalsy(`phone "${number}" should be valid`);
      });
    });

    it('should not pass always invalid numbers', () => {
      alwaysInvalidPhoneNumbers.forEach(phoneNumber => {
        phoneInputControl.setValue(phoneNumber);
        const result: ValidationErrors = validator(phoneInputControl);
        expect(result)
          .toEqual(
            { phone: { country: false, valid: false } },
            `phone "${phoneNumber}" should NOT be valid`
          );
      });
    });
  });
});
