import { AbstractControl } from '@angular/forms';
import '@angular/localize/init';

import { PersonTypeEnum } from '@pe/checkout/santander-de-pos/shared';

import { onlyLetters } from './validators';

describe('onlyLetters', () => {

  it('should validate a correct only letter as valid', () => {

    const control = { value: 'aAzZÄÖÜßäöüß' };

    expect(onlyLetters(PersonTypeEnum.Customer)(control as AbstractControl)).toEqual(null);

  });

  it('should validate a incorrect value as invalid', () => {

    const control = { value: '22oToZA171234' };
    const expectedValueCustomer = {
      external: $localize `:@@payment-santander-de-pos.inquiry.form.customer.incomeInfo.error.only_letters:`,
    };
    const expectedValueGuarantor = {
      external: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.incomeInfo.error.only_letters:`,
    };

    expect(onlyLetters(PersonTypeEnum.Customer)(control as AbstractControl)).toEqual(expectedValueCustomer);
    expect(onlyLetters(PersonTypeEnum.Guarantor)(control as AbstractControl)).toEqual(expectedValueGuarantor);

  });

});
