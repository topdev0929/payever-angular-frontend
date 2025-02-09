import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { Observable, merge, of } from 'rxjs';
import {
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { AddressAutocompleteService, AddressItem, addressMask } from '@pe/checkout/forms/address-autocomplete';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { PhoneValidators } from '@pe/checkout/forms/phone';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { AddressInterface, FormOptionInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { Locale, PREFERRED_COUNTRIES_LIST, loadCountries } from '@pe/checkout/utils/countries';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseFormOptionsInterface,
  PersonalFormValue,
  DE_EMPLOYMENT_TYPES,
  DE_MARTIAL_STATUSES,
  FormOptionsInterface,
  GuarantorRelation,
  PERSON_TYPE,
  PersonTypeEnum,
  EmploymentChoice,
} from '../../..';
import { EMPLOYMENT_FREELANCER } from '../../../../rates/components';
import { GUARANTOR_RELATIONS, ValuesTranslationsType } from '../../../constants';

import { zipCode } from './validators';

type SortedCountry = {
  label: string;
  value: string;
};

@Component({
  selector: 'customer-form',
  templateUrl: './customer-form.component.html',
  styles: [`
    .personal-residence-permit .mat-checkbox{
      padding: 0;
    }
    .personal-residence-permit .icon-24 {
      width: 24px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class CustomerFormComponent extends CompositeForm<PersonalFormValue> implements OnInit {

  private store = this.injector.get(Store);
  public readonly personType = this.injector.get(PERSON_TYPE);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  private flow = this.store.selectSnapshot(FlowState.flow);
  private options: FormOptionsInterface = this.store
    .selectSnapshot(PaymentState.options);

  private options$ = this.store.select(PaymentState.options);
  public paymentOptions$ = this.options$.pipe(
    map((options: BaseFormOptionsInterface) => ({
      ...options,
      nationalities: this.mapNationalities(options.nationalities),
      maritalStatuses: options.maritalStatuses.map(item => this.optionsMapper(DE_MARTIAL_STATUSES, item)),
    }))
  );

  protected addressAutocompleteService = this.injector.get(AddressAutocompleteService);

  public readonly guarantorRelations = GUARANTOR_RELATIONS;
  public readonly pastDateConstraints = DateConstraints.past;
  public readonly adultDateOfBirth = DateConstraints.adultDateOfBirth;
  public readonly futureDateConstraints = DateConstraints.future;
  public readonly pastOrTodayDateConstraints = DateConstraints.pastOrToday;
  public readonly addressMask = addressMask;

  public readonly addressItems$ = this.addressAutocompleteService.addressItems$;
  public employmentOptions$ = of((this.options.professions ?? [])).pipe(
    map((employmentTypes) => {
      const result = employmentTypes.map(item => this.optionsMapper(DE_EMPLOYMENT_TYPES, item));

      return result.concat([{
        label: $localize`:@@santander-de.inquiry.form.customer.freelancer.label:`,
        value: EMPLOYMENT_FREELANCER,
      }]);
    })
  );

  protected countries$ = this.getCountries().pipe(shareReplay(1));

  private readonly prevAddressForm = this.fb.group({
    _prevAddressLine: this.fb.control<string | AddressItem>(null, Validators.required),
    prevAddressCity: this.fb.control<string>(null, Validators.required),
    prevAddressCountry: this.fb.control<string>(null, Validators.required),
    prevAddressStreet: this.fb.control<string>(null, Validators.required),
    prevAddressStreetNumber: this.fb.control<string>(null, Validators.required),
    prevAddressZip: this.fb.control<string>(null, [Validators.required, zipCode]),
    prevAddressResidentSince: this.fb.control<Date>(null, RequiredDate),
  });

  public readonly formGroup = this.fb.group({
    personalBirthName: this.fb.control<string>(''),
    addressLandlinePhone: this.fb.control<string>(
      null,
      [
        PhoneValidators.codeRequired('DE'),
        PhoneValidators.country('DE', $localize`:@@santander-de.inquiry.form.customer.addressLandlinePhone.label:`),
        PhoneValidators.type('FIXED_LINE', 'DE', $localize`:@@santander-de.inquiry.form.customer.addressLandlinePhone.label:`),
      ],
    ),
    addressCellPhone: this.fb.control<string>(
      null,
      [
        Validators.required,
        PhoneValidators.codeRequired('DE'),
        PhoneValidators.country('DE', $localize`:@@santander-de.inquiry.form.customer.addressCellPhone.label:`),
        PhoneValidators.type('MOBILE', 'DE', $localize`:@@santander-de.inquiry.form.customer.addressCellPhone.label:`),
      ],
    ),
    personalNationality: this.fb.control<string>(null, Validators.required),
    personalMaritalStatus: this.fb.control<string>(null, Validators.required),
    addressResidentSince: this.fb.control<Date>(null, RequiredDate),
    prevAddress: this.prevAddressForm,
    personalPlaceOfBirth: this.fb.control<string>(null, Validators.required),
    personalDateOfBirth: this.fb.control<string>(
      null, RequiredDate,
    ),
    employment: this.fb.control<string>(
      null, Validators.required
    ),
    freelancer: this.fb.control<boolean>(
      null, Validators.required
    ),
    typeOfGuarantorRelation: this.fb.control<GuarantorRelation>(
      null, [Validators.required, (control: AbstractControl) => {
        if (
          this.isSecondApplicantRecommended()
          && control.value === GuarantorRelation.NONE
        ) {
          control.markAsTouched();

          return { recommended: $localize`:@@santander-de.inquiry.form.customer.guarantorRelation.recommended:Second applicant is recommended` };
        }

        return null;
      },
    ]),
  });

  ngOnInit(): void {
    this.personType === PersonTypeEnum.Guarantor
      ? this.formGroup.get('typeOfGuarantorRelation').disable()
      : this.formGroup.get('typeOfGuarantorRelation').enable();

    super.ngOnInit();
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16', 'help-24'],
      null,
      this.customElementService.shadowRoot
    );

    const togglePrevAddress$ = this.formGroup.get('addressResidentSince').valueChanges.pipe(
      startWith(this.formGroup.get('addressResidentSince').value),
      tap((value) => {
        dayjs(value) > dayjs().subtract(3, 'years').subtract(1, 'month')
          ? this.formGroup.get('prevAddress').enable()
          : this.formGroup.get('prevAddress').disable();
      }),
    );

    const employmentChanges$ = this.formGroup.get('employment').valueChanges.pipe(
      startWith(this.formGroup.get('employment').value),
      tap((value) => {
        const guarantorRelation = this.formGroup.get('typeOfGuarantorRelation');

        const isFreelancer = value === EMPLOYMENT_FREELANCER;
        this.formGroup.get('freelancer').setValue(isFreelancer);

        guarantorRelation.updateValueAndValidity();

        if (!guarantorRelation.dirty) {
          const defaultValue = this.isSecondApplicantRecommended()
            ? null
            : GuarantorRelation.NONE;

          guarantorRelation.setValue(defaultValue);
        }
      }),
    );


    const addressChanges$ = merge(
      this.prevAddressForm.get('prevAddressCity').valueChanges.pipe(
        map(city => ({ city })),
      ),
      this.prevAddressForm.get('prevAddressCountry').valueChanges.pipe(
        map(country => ({ country })),
        tap(() => this.prevAddressForm.get('prevAddressZip').updateValueAndValidity()),
      ),
      this.prevAddressForm.get('prevAddressStreet').valueChanges.pipe(
        map(streetName => ({ streetName })),
      ),
      this.prevAddressForm.get('prevAddressStreetNumber').valueChanges.pipe(
        map(streetNumber => ({ streetNumber })),
      ),
      this.prevAddressForm.get('prevAddressZip').valueChanges.pipe(
        map(zipCode => ({ zipCode })),
      ),
    ).pipe(
      scan((acc, curr) => ({ ...acc, ...curr }), {} as Partial<AddressInterface>),
      switchMap(value => this.countries$.pipe(
        tap((countries) => {
          const fullAddress = this.parseFullAddress(value, countries);
          this.prevAddressForm.get('_prevAddressLine').patchValue(fullAddress);
        }),
      )),
    );


    merge(
      employmentChanges$,
      addressChanges$,
      togglePrevAddress$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public selectAddressResidentSince(date: Date, datepicker: MatDatepicker<any>): void {
    const dateWithDay = new Date(date.getFullYear(), date.getMonth(), new Date().getDay());
    this.formGroup.get('addressResidentSince').setValue(dateWithDay);
    datepicker.close();
  }

  public selectPrevAddressResidentSince(date: Date, datepicker: MatDatepicker<any>): void {
    const dateWithDay = new Date(date.getFullYear(), date.getMonth(), new Date().getDay());
    this.prevAddressForm.get('prevAddressResidentSince').setValue(dateWithDay);
    datepicker.close();
  }

  public prevAddressChange(address: AddressInterface): void {
    this.prevAddressForm.patchValue({
      prevAddressCity: address.city,
      prevAddressCountry: address.country,
      prevAddressStreet: address.streetName,
      prevAddressStreetNumber: address.streetNumber,
      prevAddressZip: address.zipCode,
    });
  }

  public parseFullAddress(
    {
      street,
      streetName,
      streetNumber,
      city,
      country,
      zipCode,
    }: AddressInterface,
    countriesOptions: SortedCountry[],
  ): string {
    const countryName = countriesOptions.find(item => item.value === country)?.label || country;
    const streetParsed = streetName ? ` ${streetName} ${streetNumber ?? ''}` : null;

    return [street || streetParsed, city, zipCode, countryName].filter(Boolean).join(', ').trim();
  }

  protected trackByFn(index: number, item: SortedCountry): string {
    return item.value;
  }

  override registerOnChange(fn: (value: PersonalFormValue) => void): void {
    this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.value as any),
      tap((value) => {
        this.onTouch?.();
        fn?.({ ...value, _isValid: !this._validateRecursive(this.formGroup, true) });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }


  validate(control: AbstractControl): ValidationErrors {
    return this._validateRecursive(this.formGroup, false);
  }

  private _validateRecursive(control: AbstractControl, excludeRecommended: boolean): ValidationErrors {

    if (control instanceof FormGroup || control instanceof FormArray) {
      const controls = Object.values(control.controls);

      return controls.some(c => this._validateRecursive(c, excludeRecommended))
        ? { invalid: true }
        : control.errors;
    }

    return control.invalid
      && (!excludeRecommended || !control.errors.recommended)
      ? { invalid: true } : null;
  }

  private isSecondApplicantRecommended(): boolean {
    const employment = this.formGroup?.get('employment')?.value;

    return (employment === EmploymentChoice.STUDENT && this.flow.amount > 1_200)
      || (employment === EmploymentChoice.HOUSEWIFE_HOMEMAKER && this.flow.amount > 2_000);
  }

  private getCountries(): Observable<SortedCountry[]> {
    const language = this.localeConstantsService.getLang() as Locale;

    return loadCountries(language).pipe(
      map((countries) => {
        const sorted = Object.entries(countries).reduce((acc, [key, value]) => {
          if (PREFERRED_COUNTRIES_LIST.includes(key)) {
            acc.preferred.push({ label: value, value: key });
          } else {
            acc.rest.push({ label: value, value: key });
          }

          return acc;
        },
          { preferred: [], rest: [] });


        return sorted.preferred.concat(sorted.rest);
      }),
    );
  }

  private optionsMapper(translates: ValuesTranslationsType, item: FormOptionInterface): FormOptionInterface {
    return {
      ...item,
      label: translates[String(item.value)]
        ? translates?.[String(item.value)](item.label)
        : item.label,
    };
  }

  private mapNationalities(nationalities: FormOptionInterface[]) {
    const deIndex = nationalities.findIndex(n => n.value === 'DE');
    if (deIndex === -1) {
      return nationalities;
    }

    return [
      nationalities[deIndex],
      ...nationalities.slice(0, deIndex),
      ...nationalities.slice(deIndex + 1),
    ];
  }
}
