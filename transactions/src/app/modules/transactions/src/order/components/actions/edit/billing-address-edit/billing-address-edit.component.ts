import { Component, ChangeDetectionStrategy, EventEmitter, Input, Injector, OnInit, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';

import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { AddonType, GooglePlacesAutocompleteChangeEvent, phoneInputValidator } from '@pe/ng-kit/modules/form';
import { CountryArrayInterface, AddressService as PeAddressService } from '@pe/ng-kit/modules/address';
import { FormAbstractComponent, FormScheme, ErrorBag, SelectOptionInterface, FormSchemeField } from '@pe/ng-kit/modules/form';
import { ApiService } from '@pe/checkout-sdk/sdk/api';
import { SalutationEnum } from '@pe/checkout-sdk/sdk/types';

import {
  AddressInterface,
  ResponseErrorsInterface,
  FlowInterface
} from '@pe/checkout-sdk/sdk/types';

interface AddressFormInterface {
  id?: number;
  city?: string;
  country?: string;
  company?: string;
  email?: string;
  first_name?: string;
  full_address?: string;
  last_name?: string;
  phone?: number;
  salutation?: string;
  street?: string;
  select_address?: string;
  social_security_number?: string;
  zip_code?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-billing-address-edit',
  styleUrls: ['./billing-address-edit.component.scss'],
  templateUrl: 'billing-address-edit.component.html',
  providers: [ ErrorBag ]
})
export class BillingAddressEditComponent extends FormAbstractComponent<AddressFormInterface> implements OnInit {

  formOptions: SelectOptionInterface[] = [];
  formScheme: FormScheme;
  preferredCountries: CountryArrayInterface[] = [];
  countries: CountryArrayInterface[] = [];
  countriesOptions: SelectOptionInterface[] = [];
  presetAddressArray: SelectOptionInterface[] = [
    {
      label: this.translateService.translate('address.form.new_addresses.label'),
      value: null
    }
  ];
  fieldset: FormSchemeField[];
  address: AddressInterface = {};

  isLoading: boolean = false;

  @Input() flow: FlowInterface;
  @Input() set addressArray(addressArray: AddressInterface[]) {
    this.getSelectAddreses(addressArray);
    this.changeDetectorRef.detectChanges();
  }
  @Output() saved: EventEmitter<AddressInterface> = new EventEmitter<AddressInterface>();
  @Output('isLoading') isSaving: EventEmitter<boolean> = new EventEmitter<boolean>();

  get formStorageKey(): string {
    return `transactions_address_edit.pos-de.form.${this.flow.id}`;
  }

  private isPaymentEditMode: boolean = true;
  private isFilledFieldsReadonly: boolean = false;

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private apiService: ApiService,
    private peAddressService: PeAddressService,
    private translateService: TranslateService
  ) {
    super(injector);
    this.preferredCountries = this.peAddressService.preferredCountriesArray;
    this.countries = this.peAddressService.countriesArray;
    this.getCountriesOptions(this.preferredCountries.concat(this.countries));
    this.formOptions = [
      {
        label: this.translateService.translate('address.form.salutation.label'),
        value: null
      },
      {
        label: this.translateService.translate('salutation.SALUTATION_MR'),
        value: 'SALUTATION_MR'
      },
      {
        label: this.translateService.translate('salutation.SALUTATION_MRS'),
        value: 'SALUTATION_MRS'
      }
    ];
  }

  ngOnInit(): void {
    this.address = this.flow.billing_address;
  }

  onSuccess(): void {
    const address: AddressInterface = this.form.value;
    this.isLoading = true;
    this.isSaving.emit(true);
    this.changeDetectorRef.detectChanges();
    this.saveAddress(address).pipe(takeUntil(this.destroyed$)).subscribe(
      (flow: FlowInterface) => {
        if (flow) {
          this.onSaveSuccess(flow.billing_address);
        }
        this.isLoading = false;
        this.isSaving.emit(false);
      },
      (error: ResponseErrorsInterface) => {
        this.isLoading = false;
        this.isSaving.emit(false);
        this.handleErrors(error);
      }
    );
  }

  protected onUpdateFormData(formValues: any): void {
    this.toggleControl('salutation', !this.flow.hide_salutation);
    this.toggleControl('country', !this.isPaymentEditMode);
    this.toggleControl('full_address', !this.isPaymentEditMode);
    this.saveDataToStorage();
  }

  protected createForm(initialData: AddressFormInterface): void {
    const flow: FlowInterface = this.flow;
    const address: AddressInterface = flow.billing_address || {};

    this.form = this.formBuilder.group({
      select_address: address['select_address'] || initialData.select_address || '',
      city: [address.city || initialData.city, Validators.required],
      company: address.company || initialData.company,
      country: [address.country || initialData.country, Validators.required],
      email: [address.email || initialData.email, [Validators.required, Validators.email]],
      first_name: [address.first_name || initialData.first_name, Validators.required],
      full_address: [address.full_address || initialData.full_address],
      id: address.id || initialData.id,
      last_name: [address.last_name || initialData.last_name, Validators.required],
      phone: address.phone || initialData.phone,
      salutation: [address.salutation || initialData.salutation || null, [Validators.required]],
      social_security_number: address.social_security_number || '',
      street: [address.street || initialData.street, Validators.required],
      type: [address.type, Validators.required],
      zip_code: [address.zip_code || initialData.zip_code, Validators.required]
    });

    // TODO: fix in PhoneInput (phoneInputValidator() should support
    // optional value for form, write tests)!
    this.form.get('phone').valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        value => value ?
          this.form.get('phone').setValidators(phoneInputValidator({ countryControl: this.form.get('country') })) :
          this.form.get('phone').setValidators([]));

    this.form.get('select_address').valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((value: AddressFormInterface) => {
        if (value === null) {
          this.form.patchValue({
            email: '',
            city: '',
            country: '',
            first_name: '',
            full_address: '',
            last_name: '',
            phone: '',
            salutation: '',
            social_security_number: '',
            street: '',
            zip_code: ''
          });
        }
        else {
          this.form.patchValue({
            city: value.city,
            country: value.country,
            first_name: value.first_name,
            full_address: value.full_address,
            last_name: value.last_name,
            street: value.street,
            social_security_number: value.social_security_number,
            zip_code: value.zip_code
          });
        }
      });

    this.formScheme = {
      fieldsets: {
        first: [
          {
            name: (this.presetAddressArray.length > 1) ? 'select_address' : '',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-12',
              readonly: this.isFilledFieldsReadonly
            },
            selectSettings: {
              options: this.presetAddressArray
            }
          }, {
            name: 'email',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12',
              required: true,
              readonly: this.isReadonly(address.email)
            }
          }, {
            name: 'salutation',
            type: 'select',
            fieldSettings: {
              classList: flow.hide_salutation ? 'hide' : 'col-xs-3 col-sm-3',
              required: flow.hide_salutation ? false : true,
              readonly: this.isReadonly(address.salutation)
            },
            selectSettings: {
              options: this.formOptions
            }
          }, {
            name: 'first_name',
            type: 'input',
            fieldSettings: {
              classList: flow.hide_salutation ? 'col-xs-12 col-sm-6' : 'col-xs-4 col-sm-4',
              required: true,
              readonly: this.isReadonly(address.first_name)
            }
          }, {
            name: 'last_name',
            type: 'input',
            fieldSettings: {
              classList: flow.hide_salutation ? 'col-xs-12 col-sm-6' : 'col-xs-5 col-sm-5',
              required: true,
              readonly: this.isReadonly(address.last_name)
            }
          }, {
            name: 'full_address',
            type: 'autocomplete-google-places',
            fieldSettings: {
              classList: 'col-xs-12',
              readonly: this.isReadonly(address.full_address)
            },
            addonPrepend: {
              addonType: AddonType.Icon,
              iconId: 'icon-geocoder-24',
              iconSize: 24
            },
            autocompleteGooglePlacesSettings: {
              onValueChange: (event: GooglePlacesAutocompleteChangeEvent) => {
                this.address = event.address as AddressInterface;
                this.form.get('city').setValue(this.address.city, { emitEvent: false });
                this.form.get('country').setValue(this.address.country, { emitEvent: false });
                this.form.get('street').setValue(this.address.street, { emitEvent: false });
                this.form.get('zip_code').setValue(this.address.zip_code, { emitEvent: false });
              }
            }
          }, {
            name: 'country',
            type: 'select',
            fieldSettings: {
              classList: 'col-xs-6',
              required: true,
              readonly: this.isReadonly(address.country)
            },
            selectSettings: {
              options: this.countriesOptions
            },
            linkedControls: [
              {
                control: this.form.controls['full_address'],
                transform: (data: any): string => {
                  return this.peAddressService.getAddressString(this.peAddressService.mutateAddress(this.address, 'country', data));
                }
              }
            ]
          }, {
            name: 'city',
            type: 'input',
            fieldSettings: {
              classList: this.isPaymentEditMode ? 'col-xs-12' : 'col-xs-6',
              required: true,
              readonly: this.isReadonly(address.city)
            },
            linkedControls: [
              {
                control: this.form.controls['full_address'],
                transform: (data: any): string => {
                  return this.peAddressService.getAddressString(this.peAddressService.mutateAddress(this.address, 'city', data));
                }
              }
            ]
          }, {
            name: 'street',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-9',
              required: true,
              readonly: this.isReadonly(address.street)
            },
            linkedControls: [
              {
                control: this.form.controls['full_address'],
                transform: (data: any): string => {
                  return this.peAddressService.getAddressString(this.peAddressService.mutateAddress(this.address, 'street', data));
                }
              }
            ]
          }, {
            name: 'zip_code',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-3',
              required: true,
              readonly: this.isReadonly(address.zip_code)
            },
            linkedControls: [
              {
                control: this.form.controls['full_address'],
                transform: (data: any): string => {
                  return this.peAddressService.getAddressString(this.peAddressService.mutateAddress(this.address, 'zip_code', data));
                }
              }
            ]
          }, {
            name: 'social_security_number',
            type: 'input',
            fieldSettings: {
              classList: 'hidden',
              readonly: this.isReadonly(address.social_security_number)
            }
          }, {
            name: 'company',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-8',
              readonly: this.isReadonly(address.company)
            }
          }, {
            name: 'phone',
            type: 'phone-input',
            fieldSettings: {
              classList: 'col-xs-12 col-sm-4',
              readonly: this.isReadonly(address.phone)
            }
          }
        ]
      }
    };
    this.fieldset = this.formScheme.fieldsets['first'];
    this.changeDetectorRef.detectChanges();
  }

  private getCountriesOptions(countries: CountryArrayInterface[]): void {
    this.countriesOptions = countries.map((country: CountryArrayInterface) => {
      return {
        label: country.name,
        value: country.code
      };
    });
  }

  private getSelectAddreses(addresses: AddressInterface[]): void {
    const addressesArray: SelectOptionInterface[] = addresses.map((address: AddressInterface) => {
      return {
        label: address.full_address,
        value: address
      };
    });
    this.presetAddressArray = this.presetAddressArray.concat(addressesArray);
  }

  private handleErrors(data: ResponseErrorsInterface): void {
    if (data.errors) {
      this.errorBag.setErrors(data.errors);
    } else {
      console.warn(data);
      this.errorBag.setErrors({
        email: data.message
      });
    }
    this.isLoading = false;
    this.changeDetectorRef.detectChanges();
  }

  private onSaveSuccess(address: AddressInterface): void {
    if ( this.isAddressValid(address) ) {
      this.flushDataStorage();
      this.saved.next(address);
    }
    else {
      // TODO: add error notification with @pe/ui-kit/modules/notification2 module.
      console.warn(address);
      this.isLoading = false;
    }
  }

  private isReadonly(value: any): boolean {
    return !!value && this.isFilledFieldsReadonly;
  }

  private isAddressValid(address: AddressInterface): boolean {
    let valid: boolean = Boolean(address.email)
      && Boolean(address.first_name)
      && Boolean(address.last_name)
      && Boolean(address.city)
      && Boolean(address.country)
      && Boolean(address.street)
      && Boolean(address.zip_code);
    if ( valid && !this.flow.hide_salutation ) {
      valid = Boolean(address.salutation);
    }
    return valid;
  }

  private saveAddress(address: AddressInterface): Observable<FlowInterface> {
    const flow: FlowInterface = this.flow;
    address = cloneDeep(address);
    if (flow.hide_salutation) {
      // Hack requested by BE
      address.salutation = SalutationEnum.SALUTATION_MR;
    }
    let result: Observable<FlowInterface>;
    if (address.id) {
      result = this.apiService._updateAddress(flow.id, String(address.id), address);
    }
    else {
      result = this.apiService._addAddress(flow.id, address);
    }
    return result;
  }
}
