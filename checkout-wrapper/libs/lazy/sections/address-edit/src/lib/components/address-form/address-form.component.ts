import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js/max';
import { Subject, defer, merge, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { CheckoutFormsCoreModule, CompositeForm } from '@pe/checkout/forms';
import { CheckoutAddressAutocompleteModule, addressMask } from '@pe/checkout/forms/address-autocomplete';
import { emailRequiredValidator } from '@pe/checkout/forms/email';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { namePatternValidator } from '@pe/checkout/forms/name';
import { PhoneValidators } from '@pe/checkout/forms/phone';
import { POSTAL_PATTERNS_BY_COUNTRY, ZipCodeValidators } from '@pe/checkout/forms/zip-code';
import { FlowState } from '@pe/checkout/store';
import {
  AddressInterface,
  BusinessToCustomerMap,
  BusinessType,
  CUSTOMER_TYPE_I18N,
  CustomerType,
  FlowInterface,
  GetCompanyResponseDto,
  PaymentAddressSettingsInterface,
} from '@pe/checkout/types';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { CheckoutUiIconModule } from '@pe/checkout/ui/icon';
import { UtilsModule } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { AddressValidators, SALUTATION_OPTIONS } from '../../constants';
import { AddressApiService, AddressService } from '../../services';

function companyValidator (control: AbstractControl): ValidationErrors {
  const company: GetCompanyResponseDto | string = control.value;
  if (!company) {return null}

  if (typeof company === 'string') {
    return { pattern: true };
  }

  return company?.id ? null : { pattern: true };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'address-form',
  styleUrls: ['./address-form.component.scss'],
  templateUrl: 'address-form.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsInputModule,
    CheckoutAddressAutocompleteModule,
    CheckoutFormsCoreModule,
    UtilsModule,
    CheckoutUiIconModule,
    ContinueButtonModule,
  ],
  providers: [
    PeDestroyService,
    AddressApiService,
    AddressService,
  ],
})
export class AddressFormComponent extends CompositeForm<unknown> implements OnInit {

  private readonly addressService = inject(AddressService);

  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;

  @Input() paymentSettings: PaymentAddressSettingsInterface;

  @Input() isFilledFieldsReadonly = true;

  @Input() isPhoneRequired: boolean;

  @Input() isCodeForPhoneRequired: boolean;

  @Input() isShipping: boolean;

  public readonly salutationFormOptions = SALUTATION_OPTIONS;
  protected readonly customerTypes = Object.values(CustomerType)
    .map(value => ({ name: CUSTOMER_TYPE_I18N[value], value }));

  protected readonly formGroup = this.fb.group({
    customerType: this.fb.control<CustomerType>(
      {
        value: this.flow.customerType ?? BusinessToCustomerMap[this.flow.businessType],
        disabled: this.flow.businessType !== BusinessType.Mixed,
      },
      [Validators.required],
    ),
    company: this.fb.control<GetCompanyResponseDto>(
      this.flow.company
        ? {
            id: this.flow.company.externalId,
            name: this.flow.company.name,
          }
        : null,
      [
        Validators.required,
        companyValidator,
      ],
    ),
    organizationName: this.fb.control<string>('', [
      Validators.required,
      Validators.pattern(/\S+/),
    ]),
    email: this.fb.control<string>(null, emailRequiredValidator),
    salutation: this.fb.control<string>(null, [Validators.required]),
    firstName: this.fb.control<string>(null, [
      Validators.required,
      Validators.pattern(/\S+/),
      namePatternValidator,
    ]),
    lastName: this.fb.control<string>(null, [
      Validators.required,
      Validators.pattern(/\S+/),
      namePatternValidator,
    ]),
    country: this.fb.control<string>(null, [Validators.required]),
    city: this.fb.control<string>(null, [
      Validators.required,
      Validators.pattern(/^(\D*)$/),
    ]),
    fullAddress: this.fb.control<string>(null),
    street: this.fb.control<string>(null, [
      Validators.required,
      AddressValidators.houseNumberRequired,
    ]),
    streetName: this.fb.control<string>(null),
    streetNumber: this.fb.control<string>(null),
    socialSecurityNumber: this.fb.control<string>(null),
    zipCode: this.fb.control<string>(null, [ZipCodeValidators.Required]),
    phone: this.fb.control<string>(null),
  });

  private readonly companySubject$ = new Subject<string>();
  protected readonly companies$ = defer(() => this.companySubject$.pipe(
    debounceTime(300),
    switchMap(company => company
      ? this.addressService.getCompany({
          company,
          country: this.formGroup.value.country,
        }).pipe(
          catchError(() => of([])),
        )
      : of([])
    ),
  )).pipe(
    shareReplay(1),
  );

  protected readonly companyLoading$ = merge(
    this.companies$.pipe(map(() => false)),
    this.companySubject$.pipe(map(() => true)),
  );

  public readonly addresses$ = defer(() => this.formGroup.get('fullAddress').valueChanges.pipe(
    debounceTime(200),
    switchMap(value => this.addressService.getAddresses(value).pipe(
      catchError(() => of([])),
    )),
  ));

  public readonly countriesOptions$ = this.addressService.getCountries().pipe(
    shareReplay(1),
  );

  public readonly countryChanges$ = defer(() => this.formGroup.get('country').valueChanges.pipe(
    startWith(this.formGroup.get('country').value),
  ));

  public isPhoneFieldHidden(): boolean {
    return this.paymentSettings?.isPhoneFieldHidden;
  }

  private parsePhoneNumber: typeof parsePhoneNumber;

  protected readonly addressMask = addressMask;
  protected readonly displayCompany = (company: GetCompanyResponseDto) => company?.name ?? '';

  ngOnInit(): void {
    super.ngOnInit();

    this.loadSvgIcons();

    const basePhoneValidatorRequired = this.setupPhoneValidators();

    this.markFieldsAsReadonly();

    const toggleCompany$ = this.formGroup.get('customerType').valueChanges.pipe(
      startWith(this.formGroup.get('customerType').value),
      tap((customerType) => {
        const companyControl = this.formGroup.get('company');
        const organizationControl = this.formGroup.get('organizationName');
        if (customerType === CustomerType.Organization) {
          if (this.flow.b2bSearch && !this.isShipping) {
            companyControl.enable();
            organizationControl.disable();
          } else {
            companyControl.disable();
            organizationControl.enable();
          }
        } else {
          companyControl.disable();
          organizationControl.disable();
        }
      }),
    );

    merge(
      this.setupZipCodeValidation(),
      this.setupPhoneValidationBasedOnCountry(basePhoneValidatorRequired),
      this.setupFullAddressUpdates(),
      toggleCompany$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private loadSvgIcons() {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['geocoder-24'],
      null,
      this.customElementService.shadowRoot
    );
  }

  private setupPhoneValidators() {
    const basePhoneValidatorRequired = this.isPhoneRequired ? [Validators.required] : [];
    if (this.paymentSettings) {
      basePhoneValidatorRequired.push(AddressValidators.phoneValid(
        this.isPhoneRequired,
        this.paymentSettings.codeRequired,
        this.paymentSettings.phonePattern,
        this.paymentSettings.phonePatternCodeRequired,
      ));
      this.formGroup.get('phone').setValidators(basePhoneValidatorRequired);
      this.formGroup.updateValueAndValidity();
    } else {
      this.loadLibPhoneNumber();
    }

    return basePhoneValidatorRequired;
  }

  private setupZipCodeValidation() {
    return this.formGroup.get('country').valueChanges
    .pipe(
      startWith(this.formGroup.get('country').value),
      tap((value: string) => {
        this.formGroup.get('zipCode').setValidators([
          ZipCodeValidators.Required,
          ZipCodeValidators.zipCodeValid(this.paymentSettings?.postalCodePattern || POSTAL_PATTERNS_BY_COUNTRY[value]),
        ]);
        this.formGroup.get('zipCode').updateValueAndValidity();
      })
    );
  }

  private setupPhoneValidationBasedOnCountry(basePhoneValidatorRequired: ValidatorFn[]) {
    return this.formGroup.get('country').valueChanges.pipe(
      startWith(this.formGroup.get('country').value),
      tap((country) => {
        const codeRequired = this.isCodeForPhoneRequired;
        const controlName = $localize`:@@checkout_address_edit.form.phone.label:`;
        const countryCode = (this.paymentSettings?.countryCode || country) as CountryCode;
        const validators = [
          PhoneValidators.country(countryCode, controlName),
          ...basePhoneValidatorRequired,
        ];
        codeRequired && validators.push(PhoneValidators.codeRequired(countryCode));
        this.formGroup.get('phone').setValidators(validators);
        this.formGroup.get('phone').updateValueAndValidity();
      })
    );
  }

  private setupFullAddressUpdates() {
    return merge(
      this.formGroup.get('country').valueChanges.pipe(
        startWith(this.formGroup.get('country').value),
        map(country => ({ country })),
      ),
      this.formGroup.get('city').valueChanges.pipe(
        startWith(this.formGroup.get('city').value),
        map(city => ({ city })),
      ),
      this.formGroup.get('street').valueChanges.pipe(
        startWith(this.formGroup.get('street').value),
        map(street => ({ street })),
        tap(({ street }) => {
          const streetName = street?.split(/(\d+)/)[0]?.trim();
          const streetNumber = street?.split(/(\d+)/)[1]?.trim();

          this.formGroup.get('streetName').setValue(streetName);
          this.formGroup.get('streetNumber').setValue(streetNumber);
        }),
      ),
      this.formGroup.get('zipCode').valueChanges.pipe(
        startWith(this.formGroup.get('zipCode').value),
        map(zipCode => ({ zipCode })),
      ),
    ).pipe(
      scan((acc, curr) => ({ ...acc, ...curr }), {} as AddressInterface),
      debounceTime(100),
      switchMap(value => this.countriesOptions$.pipe(
        tap((countries) => {
          const fullAddress = this.addressService.parseFullAddress(value, countries);
          this.formGroup.get('fullAddress').patchValue(fullAddress, { emitEvent: false });
        }),
      )),
    );
  }

  public fullAddressChange(value: Partial<any>): void {
    this.formGroup.patchValue(value);
  }

  private markFieldsAsReadonly(): void {
    this.isFilledFieldsReadonly && Object.values(this.formGroup.controls).forEach((control) => {
      if (control.value) {
        control.disable();
      }
    });
  }

  private loadLibPhoneNumber(): void {
    import('libphonenumber-js/max').then((m) => {
      this.parsePhoneNumber = m.parsePhoneNumber;
    });
  }

  // Unfortunately we need to use this workaround because of a bug in angular
  // otherwise the mask wont be applied.
  // see https://github.com/angular/angular/issues/43484
  onCompanySelected(company: GetCompanyResponseDto) {
    this.formGroup.patchValue({
      company: company,
      city: company.address.city,
      country: company.address.countryCode,
      street: [company.address.streetName, company.address.streetNumber]
        .filter(Boolean)
        .join(' ')
        .trim(),
      streetName: company.address.streetName,
      streetNumber: company.address.streetNumber,
      zipCode: company.address.postCode,
    });
  }

  protected onCompanyInput(event: Event) {
    const value = (event.target as HTMLInputElement).value?.trim();
    this.companySubject$.next(value);
  }
}
