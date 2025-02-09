import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { BehaviorSubject, Observable, combineLatest, merge } from 'rxjs';
import { map, scan, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CompositeForm } from '@pe/checkout/forms';
import { AddressAutocompleteService, AddressItem, addressMask } from '@pe/checkout/forms/address-autocomplete';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import {
  PERSON_TYPE,
  PrevAddressFormValue,
  FormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { PaymentState } from '@pe/checkout/store';
import { AddressInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { Locale, PREFERRED_COUNTRIES_LIST, loadCountries } from '@pe/checkout/utils/countries';

import { zipCode } from './validators';

type SortedCountry = { label: string; value: string };

const ANALYTICS_FORM_NAME = 'FORM_PAYMENT_PREV_ADDRESS';

@Component({
  selector: 'prev-address-form',
  templateUrl: './address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: ANALYTICS_FORM_SETTINGS,
    useValue: {
      formName: ANALYTICS_FORM_NAME,
    },
  }],
})
export class PreviousAddressFormComponent extends CompositeForm<PrevAddressFormValue> implements OnInit {
  @Input({ required: true }) set maxDate(date: Date) {
    date && this.maxDate$.next(dayjs(date).subtract(1, 'd').toDate());
    this.formGroup.get('prevAddressResidentSince').setValue(null);
  }

  private store = this.injector.get(Store);
  public personType = this.injector.get(PERSON_TYPE);
  private localeConstantsService = this.injector.get(LocaleConstantsService);
  protected addressAutocompleteService = this.injector.get(AddressAutocompleteService);

  private readonly paymentForm: FormValue = this.store.selectSnapshot(PaymentState.form);

  get prevAddressFormValue(): PrevAddressFormValue {
    return this.paymentForm?.[this.personType]?.prevAddressForm
      ?? {};
  }

  public readonly formGroup = this.fb.group({
    prevAddressResidentSince: this.fb.control<Date>(
      this.prevAddressFormValue.prevAddressResidentSince, RequiredDate),
    _prevAddressLine: this.fb.control<string | AddressItem>(
      this.prevAddressFormValue._prevAddressLine, Validators.required),
    prevAddressCountry: this.fb.control<string>(
      this.prevAddressFormValue.prevAddressCountry, Validators.required),
    prevAddressCity: this.fb.control<string>(
      this.prevAddressFormValue.prevAddressCity, Validators.required),
    prevAddressZip: this.fb.control<string>(
      this.prevAddressFormValue.prevAddressZip,
      [
        Validators.required,
        zipCode,
      ],
    ),
    prevAddressStreet: this.fb.control<string>(
      this.prevAddressFormValue.prevAddressStreet, Validators.required),
    prevAddressStreetNumber: this.fb.control<string>(
      this.prevAddressFormValue.prevAddressStreetNumber, Validators.required),
  });

  public readonly pastDateConstraints = DateConstraints.past;
  public readonly addressMask = addressMask;

  public readonly addressItems$ = this.addressAutocompleteService.addressItems$;
  public readonly maxDate$ = new BehaviorSubject<Date>(this.pastDateConstraints.max);

  protected countries$ = this.getCountries().pipe(shareReplay(1));

  ngOnInit(): void {
    super.ngOnInit();

    const addressChanges$ = combineLatest([
      this.formGroup.get('prevAddressCity').valueChanges.pipe(
        startWith(this.formGroup.get('prevAddressCity').value),
        map(city => ({ city })),
      ),
      this.formGroup.get('prevAddressCountry').valueChanges.pipe(
        startWith(this.formGroup.get('prevAddressCountry').value),
        map(country => ({ country })),
        tap(() => this.formGroup.get('prevAddressZip').updateValueAndValidity()),
      ),
      this.formGroup.get('prevAddressStreet').valueChanges.pipe(
        startWith(this.formGroup.get('prevAddressStreet').value),
        map(streetName => ({ streetName })),
      ),
      this.formGroup.get('prevAddressStreetNumber').valueChanges.pipe(
        startWith(this.formGroup.get('prevAddressStreetNumber').value),
        map(streetNumber => ({ streetNumber })),
      ),
      this.formGroup.get('prevAddressZip').valueChanges.pipe(
        startWith(this.formGroup.get('prevAddressZip').value),
        map(zipCode => ({ zipCode })),
      ),
    ]).pipe(
      scan((acc, curr) => Object.entries({ ...acc, ...curr }).reduce<Partial<AddressInterface>>(
        (acc, [, value]) => ({ ...acc, ...value as Partial<AddressInterface> }),
        {}
      ), {} as Partial<AddressInterface>),
      switchMap(address => this.countries$.pipe(
        tap((countries) => {
          const fullAddress = this.parseFullAddress(address, countries);
          this.formGroup.get('_prevAddressLine').setValue(fullAddress);
        }),
      )),
    );

    merge(
      addressChanges$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public fullAddressChange(address: Partial<AddressInterface>): void {
    this.formGroup.patchValue({
      prevAddressCountry: address.country,
      prevAddressCity: address.city,
      prevAddressZip: address.zipCode,
      prevAddressStreet: address.streetName,
      prevAddressStreetNumber: address.streetNumber,
    });
  }

  public selectPrevAddressResidentSince(date: Date, datepicker: MatDatepicker<unknown>): void {
    datepicker.close();
    const dateWithDay = new Date(date.getFullYear(), date.getMonth(), new Date().getDay());
    this.formGroup.get('prevAddressResidentSince').setValue(dateWithDay);
  }

  private parseFullAddress({
    city,
    country,
    streetName,
    streetNumber,
    zipCode,
  }: Partial<AddressInterface>,
    countriesOptions: SortedCountry[],
  ): string {
    const countryName = countriesOptions.find(item => item.value === country)?.label || country;
    const streetParsed = streetName ? ` ${streetName} ${streetNumber ?? ''}` : null;

    return [streetParsed, city, zipCode, countryName].filter(Boolean).join(', ').trim();
  }

  protected trackByFn(index: number, item: SortedCountry): string {
    return item.value;
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
}
