import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectorRef, Directive, Injector, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import memoize from 'fast-memoize';


import { DATE_SETTINGS } from '@pe/checkout/forms/date';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { FormOptionsInterface } from '../types';

@Directive()
export abstract class BaseSummaryComponent {
  @Input() currency: string;
  @Input() formOptions: FormOptionsInterface;

  readonly keyRoot: string = 'payment-santander-de-pos';

  protected percentPipe = this.injector.get(PercentPipe);
  protected currencyPipe = this.injector.get(CurrencyPipe);
  protected cdr = this.injector.get(ChangeDetectorRef);
  protected store = this.injector.get(Store);
  protected destroy$ = this.injector.get(PeDestroyService);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);

  formTranslations: any = {
    _borrowerActsOnItsOwnAccount: $localize `:@@payment-santander-de-pos.inquiry.form._borrowerActsOnItsOwnAccount.label:`,
    _borrowerAgreeToBeAdvised: $localize `:@@payment-santander-de-pos.inquiry.form._borrowerAgreeToBeAdvised.label:`,
    _borrowerWasGivenRelevantPrivacyPolicy: $localize `:@@payment-santander-de-pos.inquiry.form._borrowerWasGivenRelevantPrivacyPolicy.label:`,
    webIdConditionsAccepted: $localize `:@@payment-santander-de-pos.inquiry.form.webIdConditionsAccepted.label:`,
    _agreeToBeAdvised: $localize `:@@payment-santander-de-pos.inquiry.form._agreeToBeAdvised.label:`,
    commodityGroup: $localize `:@@payment-santander-de-pos.inquiry.form.commodityGroup.label:`,
    _condition_view: $localize `:@@payment-santander-de-pos.inquiry.form._condition_view.label:`,
    _program_view: $localize `:@@payment-santander-de-pos.inquiry.form._program_view.label:`,
    downPayment: $localize `:@@payment-santander-de-pos.inquiry.form.downPayment.label:`,
    condition: $localize `:@@payment-santander-de-pos.inquiry.form.condition.label:`,
    customer: {
      personalDateOfBirth: $localize `:@@payment-santander-de-pos.inquiry.form.customer.personalDateOfBirth.label:`,
      profession: $localize `:@@payment-santander-de-pos.inquiry.form.customer.profession.label:`,
      addressFirstName: $localize `:@@payment-santander-de-pos.inquiry.form.customer.addressFirstName.label:`,
      addressLastName: $localize `:@@payment-santander-de-pos.inquiry.form.customer.addressLastName.label:`,
      contactEmail: $localize `:@@payment-santander-de-pos.inquiry.form.customer.contactEmail.label:`,
      addressResidentSince: $localize `:@@payment-santander-de-pos.inquiry.form.customer.addressResidentSince.label:`,
      addressPhoneNumber: $localize `:@@payment-santander-de-pos.inquiry.form.customer.addressPhoneNumber.label:`,
      identificationNumber: $localize `:@@payment-santander-de-pos.inquiry.form.customer.identificationNumber.label:`,
      identificationPlaceOfIssue: $localize `:@@payment-santander-de-pos.inquiry.form.customer.identificationPlaceOfIssue.label:`,
      identificationDateOfIssue: $localize `:@@payment-santander-de-pos.inquiry.form.customer.identificationDateOfIssue.label:`,
      identificationDateOfExpiry: $localize `:@@payment-santander-de-pos.inquiry.form.customer.identificationDateOfExpiry.label:`,
      identificationIssuingAuthority: $localize `:@@payment-santander-de-pos.inquiry.form.customer.identificationIssuingAuthority.label:`,
      numberOfChildren: $localize `:@@payment-santander-de-pos.inquiry.form.customer.numberOfChildren.label:`,
      personalMaritalStatus: $localize `:@@payment-santander-de-pos.inquiry.form.customer.personalMaritalStatus.label:`,
      personalNationality: $localize `:@@payment-santander-de-pos.inquiry.form.customer.personalNationality.label:`,
      personalPlaceOfBirth: $localize `:@@payment-santander-de-pos.inquiry.form.customer.personalPlaceOfBirth.label:`,
      netIncome: $localize `:@@payment-santander-de-pos.inquiry.form.customer.netIncome.label:`,
      typeOfResident: $localize `:@@payment-santander-de-pos.inquiry.form.customer.typeOfResident.label:`,
      housingCosts: $localize `:@@payment-santander-de-pos.inquiry.form.customer.housingCosts.label:`,
      employer: $localize `:@@payment-santander-de-pos.inquiry.form.customer.employer.label:`,
      employedSince: $localize `:@@payment-santander-de-pos.inquiry.form.customer.employedSince.label:`,
      typeOfIdentification: $localize `:@@payment-santander-de-pos.inquiry.form.customer.typeOfIdentification.label:`,
    },
    guarantor: {
      addressFirstName: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.addressFirstName.label:`,
      addressLastName: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.addressLastName.label:`,
      contactEmail: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.contactEmail.label:`,
      addressResidentSince: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.addressResidentSince.label:`,
      addressPhoneNumber: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.addressPhoneNumber.label:`,
      identificationNumber: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.identificationNumber.label:`,
      identificationPlaceOfIssue: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.identificationPlaceOfIssue.label:`,
      identificationDateOfIssue: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.identificationDateOfIssue.label:`,
      identificationDateOfExpiry: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.identificationDateOfExpiry.label:`,
      identificationIssuingAuthority: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.identificationIssuingAuthority.label:`,
      numberOfChildren: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.numberOfChildren.label:`,
      personalMaritalStatus: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.personalMaritalStatus.label:`,
      personalNationality: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.personalNationality.label:`,
      personalPlaceOfBirth: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.personalPlaceOfBirth.label:`,
      netIncome: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.netIncome.label:`,
      typeOfResident: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.typeOfResident.label:`,
      housingCosts: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.housingCosts.label:`,
      employer: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.employer.label:`,
      employedSince: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.employedSince.label:`,
      typeOfIdentification: $localize `:@@payment-santander-de-pos.inquiry.form.guarantor.typeOfIdentification.label:`,
    },
  };

  constructor(protected injector: Injector) {}

  makeFormKey(key: string): string {
    const keys = key.split('.');
    const obj = keys.reduce((acc, curr) => acc[curr], this.formTranslations);

    return obj;
  }

  formatDateMemo = memoize(this.formatDate.bind(this));

  private formatDate(date: string | Date) {
    return dayjs(date).format(DATE_SETTINGS.fullDate.format);
  }
}
