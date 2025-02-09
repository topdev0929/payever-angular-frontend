import { AbstractControl } from '@angular/forms';

import { PersonTypeEnum } from '../../../../../common';

export function onlyLetters(personType: PersonTypeEnum): (control: AbstractControl) => void {
  return (control: AbstractControl) => {
    if (/^[a-zA-Z\sÄÖÜßäöü]*$/.test(control.value)) {
      return null;
    }

    const translate = {
      [PersonTypeEnum.Customer]: $localize `:@@payment-santander-de-pos.inquiry.form.customer.incomeInfo.error.only_letters:`,
      [PersonTypeEnum.Guarantor]: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.incomeInfo.error.only_letters:`,
    };

    return { external: translate[personType] };
  };
}

