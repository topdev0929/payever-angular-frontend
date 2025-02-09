import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { defer, merge, Observable, of, Subject } from 'rxjs';
import {
  map,
  switchMap,
  filter,
  scan,
  startWith,
  tap,
  debounceTime,
  takeUntil,
  shareReplay,
  catchError,
} from 'rxjs/operators';

import { ANALYTICS_FORM_SETTINGS, AnalyticsFormService } from '@pe/checkout/analytics';
import { SaveProgressHelperService, SSN_PATTERN } from '@pe/checkout/core';
import { AddressAutocompleteService, addressMask } from '@pe/checkout/forms/address-autocomplete';
import { emailRequiredValidator } from '@pe/checkout/forms/email';
import { AddressStorageService } from '@pe/checkout/storage';
import { FlowState, OpenNextStep, PatchFlow } from '@pe/checkout/store';
import {
  AddressInterface,
  BusinessToCustomerMap,
  BusinessType,
  CUSTOMER_TYPE_I18N,
  CustomerType,
  FlowInterface,
  GetCompanyResponseDto,
  SalutationEnum,
} from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { UserService } from '../../services';

interface ViewModel {
  canLogin: boolean;
  emails: string[];
}

const MIN_ADDR_LENGTH = 8;

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
  selector: 'checkout-main-user-check-form',
  templateUrl: 'user-check-form.component.html',
  styleUrls: ['./user-check-form.component.scss'],
  providers: [
    PeDestroyService,
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_USER_CHECK',
      },
    },
  ],
})
export class UserCheckFormComponent implements OnInit, OnDestroy {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  @Output() toLogin = new EventEmitter<void>();

  protected readonly customerTypes = Object.values(CustomerType).map(value => ({
    name: CUSTOMER_TYPE_I18N[value],
    value,
  }));

  public readonly addressMask = addressMask;
  public readonly addressItems$ = this.addressAutocompleteService.addressItems$;

  get flowId(): string {
    return this.flow?.id;
  }

  public formGroup = this.fb.group({
    customerType: this.fb.control<CustomerType>(
      {
        value: this.flow.customerType ?? BusinessToCustomerMap[this.flow.businessType],
        disabled: this.flow.businessType !== BusinessType.Mixed,
      },
      [Validators.required],
    ),
    company: this.fb.control<Partial<GetCompanyResponseDto>>({
      disabled: true,
      value: {
        id: this.flow.company?.externalId,
        name: this.flow.company?.name,
      },
    }, [Validators.required, companyValidator]),
    organizationName: this.fb.control<string>(
      {
        disabled: true,
        value: this.flow.billingAddress?.organizationName,
      },
      [Validators.required],
    ),
    email: this.fb.control<string>(null, [emailRequiredValidator]),
    fullAddress: this.fb.control<string>(
      null,
      [Validators.minLength(MIN_ADDR_LENGTH), Validators.required],
    ),
    city: this.fb.control<string>(null),
    country: this.fb.control<string>(null),
    firstName: this.fb.control<string>(null),
    lastName: this.fb.control<string>(null),
    salutation: this.fb.control<SalutationEnum>(null),
    street: this.fb.control<string>(null),
    zipCode: this.fb.control<string>(null),
    socialSecurityNumber: this.fb.control<string>(
      { disabled: true, value: null },
      [Validators.required, Validators.pattern(new RegExp(SSN_PATTERN))],
    ),
  });

  public translations = {
    ssnSuffix: $localize`:@@user.action.use_address:`,
  };

  private readonly CHECK_EMAIL_DELAY: number = 500;
  private canLogin$ = new Subject<boolean>();
  private isLoginOpen = false;

  private emails$: Observable<string[]> = merge(
    this.formGroup.get('email').valueChanges.pipe(
      map(() => []),
    ),
    this.formGroup.get('email').valueChanges.pipe(
      tap(() => {
        this.canLogin$.next(false);
      }),
      debounceTime(this.CHECK_EMAIL_DELAY),
      filter(value => !!value
        && this.formGroup.get('email').valid
        && this.formGroup.get('email').dirty),
      switchMap((email: string) => this.userService.checkEmail(email).pipe(
        map((info) => {
          if (!info.valid) {
            this.formGroup.get('email').setErrors({ invalid: true });
          }
          if (!info.valid || info.available) {
            return [];
          }

          return [email];
        }),
      )),
    ),
  );

  public vm$ = merge(
    this.emails$.pipe(
      map(emails => ({ emails })),
    ),
    this.canLogin$.pipe(
      map(canLogin => ({ canLogin })),
    ),
  ).pipe(
    startWith({ emails: [], canLogin: false }),
    scan((acc, curr) => ({ ...acc, ...curr }), {} as ViewModel),
  );

  protected readonly companies$ = defer(() => this.companySubject$.pipe(
    debounceTime(300),
    switchMap(company => company
      ? this.userService.getCompanies({
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

  protected readonly companiesLoading$ = merge(
    this.companies$.pipe(map(() => false)),
    defer(() => this.companySubject$.pipe(map(() => true))),
  );

  private readonly companySubject$ = new Subject<string>();

  protected readonly displayCompany = (company: GetCompanyResponseDto) => company?.name ?? '';

  constructor(
    protected customElementService: CustomElementService,
    private store: Store,
    private fb: FormBuilder,
    private addressHelperService: AddressStorageService,
    private userService: UserService,
    private saveProgressHelperService: SaveProgressHelperService,
    private analyticsFormService: AnalyticsFormService,
    private destroy$: PeDestroyService,
    private addressAutocompleteService: AddressAutocompleteService,
  ) {}

  ngOnInit(): void {
    this.isLoginOpen = false;
    this.saveProgressHelperService.editting[this.flowId] = true;

    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['checkbox-checked-24', 'geocoder-24'],
      null,
      this.customElementService.shadowRoot
    );

    const address = this.addressHelperService.getTemporaryAddress(this.flow.id)
      || this.flow.billingAddress
      || this.flow.shippingAddress;

    if (address?.socialSecurityNumber) {
      this.toggleSsn();
    }

    address && this.formGroup.patchValue({
      email: address.email,
      fullAddress: address.fullAddress || this.parseFullAddress(address),
      organizationName: address.organizationName,
      city: address.city,
      country: address.country,
      firstName: address.firstName,
      lastName: address.lastName,
      salutation: address.salutation,
      street: address.street,
      zipCode: address.zipCode,
      socialSecurityNumber: address.socialSecurityNumber,
    });

    const toggleCompany$ = this.formGroup.get('customerType').valueChanges.pipe(
      startWith(this.formGroup.get('customerType').value),
      tap((type) => {
        const companyControl = this.formGroup.get('company');
        const organizationNameControl = this.formGroup.get('organizationName');
        const emailControl = this.formGroup.get('email');
        if (type === CustomerType.Organization) {
          if (this.flow.b2bSearch) {
            companyControl.enable({ emitEvent: false });
            organizationNameControl.disable({ emitEvent: false });
          } else {
            companyControl.disable({ emitEvent: false });
            organizationNameControl.enable({ emitEvent: false });
          }
          emailControl.disable({ emitEvent: false });
        } else {
          companyControl.disable({ emitEvent: false });
          organizationNameControl.disable({ emitEvent: false });
          emailControl.enable({ emitEvent: false });
        }
        this.formGroup.updateValueAndValidity();
      }),
    );

    const saveProgress$ = this.saveProgressHelperService.trigger$.pipe(
      filter(data => data.flowId === this.flowId, !this.isLoginOpen),
      tap(({ callback }) => {
        // this.submit();

        const flow = this.store.selectSnapshot(FlowState.flow);
        callback({ flow, openNextStep: false });
      }),
    );

    merge(
      toggleCompany$,
      saveProgress$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.saveProgressHelperService.editting[this.flowId] = false;
  }

  public clearEmail(): void {
    this.formGroup.get('email').reset(null);
  }

  public fullAddressChange(value: Partial<AddressInterface>): void {
    this.formGroup.patchValue(value);
  }

  public toggleSsn(): void {
    if (this.formGroup.get('fullAddress').enabled) {
      this.formGroup.get('fullAddress').disable();
      this.formGroup.get('socialSecurityNumber').enable();
    } else {
      this.formGroup.get('fullAddress').enable();
      this.formGroup.get('socialSecurityNumber').disable();
    }
    this.formGroup.updateValueAndValidity();
  }

  public login(): void {
    this.isLoginOpen = true;
    const address = this.addressHelperService.getTemporaryAddress(this.flowId) ?? {};
    this.addressHelperService.setTemporaryAddress(
      this.flowId,
      { ...address, email: this.formGroup.get('email').value },
    );
    this.toLogin.emit();
  }

  public emailSuggestionSelected(): void {
    this.canLogin$.next(true);
  }

  public submit(): void {
    const { valid, value } = this.formGroup;

    if (valid) {
      const { company, customerType, ...address } = value;

      this.addressHelperService.setTemporaryAddress(
        this.flowId,
        address,
      );

      this.store.dispatch(new PatchFlow({
        ...company && {
          company: {
            externalId: company.id,
            name: company.name,
          },
        },
        customerType,
      })).pipe(
        switchMap(() => this.store.dispatch(new OpenNextStep())),
      ).subscribe();
    }
  }

  protected onCompanyInput(event: Event) {
    const value = (event.target as HTMLInputElement).value?.trim();
    this.companySubject$.next(value);
  }

  protected onCompanySelected(company: GetCompanyResponseDto) {
    const { address } = company ?? {};

    this.formGroup.patchValue({
      company: company,
      city: address.city,
      country: address.countryCode,
      fullAddress: this.parseFullAddress({
        city: address.city,
        country: address.countryCode,
        zipCode: address.postCode,
        street: [address.streetName, address.streetNumber]
          .filter(Boolean)
          .join(' ')
          .trim(),
        streetName: address.streetName,
        streetNumber: address.streetNumber,
      }),
      street: [address.streetName, address.streetNumber]
        .filter(Boolean)
        .join(' ')
        .trim(),
      zipCode: address.postCode,
    });
  }

  private parseFullAddress({
    street,
    streetNumber,
    city,
    country,
    zipCode,
  }: AddressInterface): string {
    const countryName = country ?? '';
    const cityName = city ? ` ${city},` : '';
    const zipCodeName = zipCode ? ` ${zipCode},` : '';
    const streetName = street ? ` ${street}${streetNumber ?? ''},` : '';

    return `${streetName}${cityName}${zipCodeName} ${countryName}`.trim();
  }
}
