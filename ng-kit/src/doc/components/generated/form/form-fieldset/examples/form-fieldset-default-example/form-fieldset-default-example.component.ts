import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { assign, cloneDeep } from 'lodash-es';

import { AddressService } from '../../../../../../../kit/address';
import {
  AddonPrependStyle,
  AddonStyle,
  AddonType,
  AddressInterface,
  AutocompleteChipsType,
  ColorAutocompleteChipsSettingsInterface,
  DatepickerMode,
  DatepickerStartView,
  DatePresets,
  ErrorBag,
  FormAbstractComponent,
  FormFieldType,
  FormScheme,
  GooglePlacesAutocompleteChangeEvent,
  inputCreditCardExpirationValidator,
  inputIbanValidator,
  InputPasswordValidator,
  InputType,
  phoneInputValidator,
  SelectOptionInterface
} from '../../../../../../../kit/form';
import { FieldSettingsInterface } from '../../../../../../../kit/form-core/interfaces';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface MyFormInterface {
  iframeInputValue1: string;
  iframeInputValue2: string;
  iframeInputIbanValue: string;
  inputValue: string;
  inputOptionalValue: string;
  inputMinMaxValNumberValue: number;
  inputMinMaxLenNumberValue: number;
  filesValue: File[];
  selectValue: number;
  textareaValue: string;
  selectBooleanValue: boolean;
  checkboxValue: boolean;
  datepickerValue: string;
  datepickerValueMonth: string;
  datepickerValue2: string;
  autocompleteValue: string;
  autocompleteGooglePlacesValue: string;
  city: string;
  country: string;
  street: string;
  zip_code: string;
  inputCurrencyValue: number;
  inputCurrencyValue2: number;
  inputPasswordValue: number;
  phoneInputValue: string;
  radioValue: number;

  inlinePrependInputValue: string;
  inlinePrependAutocompleteValue: string;
  inlinePrependInputCurrencyValue: number;
  inlineInputIbanValue: string;
  inlineInputCreditCartNumberValue: string;
  inlineInputCreditCartExpirationValue: string;
  inlineInputWithMaskValue: string;
  inlinePrependInputPasswordValue: number;
  inlineAppendButtonInputValue: string;
  inlinePrependPhoneInputValue: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'doc-form-fieldset-default-example',
  templateUrl: 'form-fieldset-default-example.component.html',
  providers: [ErrorBag]
})
export class FormFieldsetDefaultExampleComponent extends FormAbstractComponent<MyFormInterface> {

  formTranslationsScope: 'test_fieldset.form';
  formScheme: FormScheme;
  testFieldset: any;

  baseFieldSettings: FieldSettingsInterface = {
    classList: 'col-xs-12 col-sm-6',
    required: true,
    blockCopyPaste: false,
  };
  colorOptions: SelectOptionInterface[] = [
    {value: 'Blue', name: 'Blue', hex: '#48A0F8'},
    {value: 'Green', name: 'Green', hex: '#81D552'},
    {value: 'Yellow', name: 'Yellow', hex: '#EEBD40'},
    {value: 'Pink', name: 'Pink', hex: '#DE68A5'},
    {value: 'Brown', name: 'Brown', hex: '#594139'},
    {value: 'Black', name: 'Black', hex: '#000000'},
    {value: 'White', name: 'White', hex: '#FFFFFF'},
    {value: 'Grey', name: 'Grey', hex: '#434243'},
  ].map(({value, name, hex}) => ({label: name, value, hexColor: hex}));
  baseColorAutoCompleteChipsSettings: ColorAutocompleteChipsSettingsInterface = {
    type: AutocompleteChipsType.COLOR,
    separatorKeys: [COMMA, ENTER],
    options: this.colorOptions,
    addOptionButton: {
      onClick(): void {
        
      },
      name: '+ Add'
    },
    autoActiveFirstOption: true,
    filter: (options: SelectOptionInterface[], enteredValue: string) => {
      return options.filter(({value}) => value.toLowerCase().startsWith(enteredValue.toLowerCase()));
    },
    colorCheckboxClasses: 'checkbox-white',
    autocompleteClassList: 'autocomplete-panel-non-scrollable'
  };
  fieldSettingsSubject: BehaviorSubject<FieldSettingsInterface> = new BehaviorSubject(this.baseFieldSettings);
  autocompleteChipsSettings = new BehaviorSubject<ColorAutocompleteChipsSettingsInterface>(this.baseColorAutoCompleteChipsSettings);

  paymentFlowId = 'ec86dc31d45d11dabb3c3fd602b02ac6';

  protected formStorageKey: string = 'test_fieldset.form';
  protected address: AddressInterface = {};

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private addressService: AddressService
  ) {
    super(injector);
  }

  getFieldSettings$(data: FieldSettingsInterface = {}): Observable<FieldSettingsInterface> {
    return this.fieldSettingsSubject.asObservable().pipe(map(a => assign(cloneDeep(a), data)));
  }

  onSuccess(): void {
    alert('Success!');
  }

  onPrepareFormTokenData(): void {
    this.prepareFormTokenData(this.getFormValuesFormatted(false)).subscribe(() => {
      alert('Saved!');
    }, () => {
      alert('Cant save! :(');
    });
  }

  logValues(): void {
    
    
  }

  toggleCopyPaste(enable: boolean): void {
    this.fieldSettingsSubject.next(assign(cloneDeep(this.baseFieldSettings), {blockCopyPaste: !enable}));
  }

  disableAll(): void {
    this.toggleControl('iframeInputValue1', false);
    this.toggleControl('iframeInputValue2', false);
    this.toggleControl('iframeInputIbanValue', false);
    this.toggleControl('inputValue', false);
    this.toggleControl('inputOptionalValue', false);
    this.toggleControl('inputMinMaxValNumberValue', false);
    this.toggleControl('inputMinMaxLenNumberValue', false);
    this.toggleControl('filesValue', false);
    this.toggleControl('selectValue', false);
    this.toggleControl('textareaValue', false);
    this.toggleControl('selectBooleanValue', false);
    this.toggleControl('checkboxValue', false);
    this.toggleControl('datepickerValue', false);
    this.toggleControl('datepickerValueMonth', false);
    this.toggleControl('datepickerValue2', false);
    this.toggleControl('autocompleteValue', false);
    this.toggleControl('autocompleteGooglePlacesValue', false);
    this.toggleControl('inputCurrencyValue', false);
    this.toggleControl('inputCurrencyValue2', false);
    this.toggleControl('inputPasswordValue', false);
    this.toggleControl('phoneInputValue', false);
    this.toggleControl('radioValue', false);
    this.toggleControl('city', false);
    this.toggleControl('country', false);
    this.toggleControl('street', false);
    this.toggleControl('zip_code', false);

    this.toggleControl('inlinePrependInputValue', false);
    this.toggleControl('inlinePrependAutocompleteValue', false);
    this.toggleControl('inlinePrependInputCurrencyValue', false);
    this.toggleControl('inlineInputIbanValue', false);
    this.toggleControl('inlineInputCreditCartNumberValue', false);
    this.toggleControl('inlineInputCreditCartExpirationValue', false);
    this.toggleControl('inlineInputWithMaskValue', false);
    this.toggleControl('inlinePrependInputPasswordValue', false);
    this.toggleControl('inlineAppendButtonInputValue', false);
    this.toggleControl('inlinePrependPhoneInputValue', false);
  }

  enableAll(): void {
    this.toggleControl('iframeInputValue1', true);
    this.toggleControl('iframeInputValue2', true);
    this.toggleControl('iframeInputIbanValue', true);
    this.toggleControl('inputValue', true);
    this.toggleControl('inputOptionalValue', true);
    this.toggleControl('inputMinMaxValNumberValue', true);
    this.toggleControl('inputMinMaxLenNumberValue', true);
    this.toggleControl('filesValue', true);
    this.toggleControl('selectValue', true);
    this.toggleControl('textareaValue', true);
    this.toggleControl('selectBooleanValue', true);
    this.toggleControl('checkboxValue', true);
    this.toggleControl('datepickerValue', true);
    this.toggleControl('datepickerValueMonth', true);
    this.toggleControl('datepickerValue2', true);
    this.toggleControl('autocompleteValue', true);
    this.toggleControl('autocompleteGooglePlacesValue', true);
    this.toggleControl('inputCurrencyValue', true);
    this.toggleControl('inputCurrencyValue2', true);
    this.toggleControl('inputPasswordValue', true);
    this.toggleControl('phoneInputValue', true);
    this.toggleControl('radioValue', true);
    this.toggleControl('city', true);
    this.toggleControl('country', true);
    this.toggleControl('street', true);
    this.toggleControl('zip_code', true);

    this.toggleControl('inlinePrependInputValue', true);
    this.toggleControl('inlinePrependAutocompleteValue', true);
    this.toggleControl('inlinePrependInputCurrencyValue', true);
    this.toggleControl('inlineInputIbanValue', true);
    this.toggleControl('inlineInputCreditCartNumberValue', true);
    this.toggleControl('inlineInputCreditCartExpirationValue', true);
    this.toggleControl('inlineInputWithMaskValue', true);
    this.toggleControl('inlinePrependInputPasswordValue', true);
    this.toggleControl('inlineAppendButtonInputValue', true);
    this.toggleControl('inlinePrependPhoneInputValue', true);
  }

  saveToCache(): void {
    this.saveDataToStorage();
  }

  addExternalErrors(): void {
    // Without this flag error state matcher will not be triggered
    this.isSubmitted = true;

    this.errorBag.setErrors({
      iframeInputValue1: 'Some external error for iframeInputValue1',
      iframeInputValue2: 'Some external error for iframeInputValue2',
      iframeInputIbanValue: 'Some external error for iframeInputIbanValue',
      inputValue: 'Some external error for inputValue',
      inputOptionalValue: 'Some external error for inputOptionalValue',
      inputMinMaxValNumberValue: 'Some external error for inputMinMaxValNumberValue',
      inputMinMaxLenNumberValue: 'Some external error for inputMinMaxLenNumberValue',
      filesValue: 'Some external error for filesValue',
      selectValue: 'Some external error for selectValue',
      textareaValue: 'Some external error for textareaValue',
      selectBooleanValue: 'Some external error for selectBooleanValue',
      checkboxValue: 'Some external error for checkboxValue',
      radioValue: 'Some external error for radioValue',
      datepickerValue: 'Some external error for datepickerValue',
      datepickerValueMonth: 'Some external error for datepickerValueMonth',
      datepickerValue2: 'Some external error for datepickerValue2',
      autocompleteValue: 'Some external error for autocompleteValue',
      autocompleteGooglePlacesValue: 'Some external error for autocompleteGooglePlacesValue',
      inputCurrencyValue: 'Some external error for inputCurrencyValue',
      inputCurrencyValue2: 'Some external error for inputCurrencyValue2',
      inputPasswordValue: 'Some external error for inputPasswordValue',
      phoneInputValue: 'Some external error for phoneInputValue',

      inlinePrependInputValue: 'Some external error for inlinePrependInputValue',
      inlinePrependAutocompleteValue: 'Some external error for inlinePrependAutocompleteValue',
      inlinePrependInputCurrencyValue: 'Some external error for inlinePrependInputCurrencyValue',
      inlineInputIbanValue: 'Some external error for inlineInputIbanValue',
      inlineInputCreditCartNumberValue: 'Some external error for inlineInputCreditCartNumberValue',
      inlineInputCreditCartExpirationValue: 'Some external error for inlineInputCreditCartExpirationValue',
      inlineInputWithMaskValue: 'Some external error for inlineInputWithMaskValue',
      inlinePrependInputPasswordValue: 'Some external error for inlinePrependInputPasswordValue',
      inlineAppendButtonInputValue: 'Some external error for inlineAppendButtonInputValue',
      inlinePrependPhoneInputValue: 'Some external error for inlinePrependPhoneInputValue',
    });
  }

  protected createForm(initialData: MyFormInterface): void {
    this.form = this.formBuilder.group({
      iframeInputValue1: [initialData.iframeInputValue1, [Validators.required, Validators.maxLength(5)]],
      iframeInputValue2: [initialData.iframeInputValue2, [Validators.required, Validators.maxLength(6)]],
      iframeInputIbanValue: [initialData.iframeInputValue2, [Validators.required]],
      inputValue: [initialData.inputValue, [Validators.required, Validators.maxLength(2)]],
      inputOptionalValue: [initialData.inputOptionalValue],
      inputMinMaxValNumberValue: [initialData.inputMinMaxValNumberValue],
      inputMinMaxLenNumberValue: [initialData.inputMinMaxLenNumberValue],
      filesValue: [initialData.filesValue, Validators.required],
      selectValue: [initialData.selectValue, Validators.required],
      textareaValue: [initialData.textareaValue, Validators.required],
      selectBooleanValue: [initialData.selectBooleanValue, Validators.required],
      checkboxValue: [true, Validators.required],
      radioValue: [initialData.radioValue, Validators.required],
      datepickerValue: [initialData.datepickerValue, Validators.required],
      datepickerValueMonth: [initialData.datepickerValueMonth, Validators.required],
      datepickerValue2: [initialData.datepickerValue2, Validators.required],
      inputCurrencyValue: [initialData.inputCurrencyValue, [Validators.required, Validators.min(1000)]],
      inputCurrencyValue2: [initialData.inputCurrencyValue2, [Validators.required, Validators.min(1000)]],
      inputPasswordValue: [initialData.inputPasswordValue, [Validators.required, InputPasswordValidator.default]],
      phoneInputValue: [initialData.phoneInputValue, Validators.required],
      autocompleteValue: [initialData.autocompleteValue, Validators.required],

      inlinePrependInputValue: [initialData.inlinePrependInputValue, Validators.required],
      inlinePrependAutocompleteValue: [initialData.inlinePrependAutocompleteValue, Validators.required],
      inlinePrependInputCurrencyValue: [initialData.inlinePrependInputCurrencyValue, [Validators.required, Validators.min(1000)]],
      inlineInputIbanValue: [initialData.inlineInputIbanValue, [Validators.required, inputIbanValidator]],
      inlineInputCreditCartNumberValue: [initialData.inlineInputCreditCartNumberValue, [Validators.required]],
      inlineInputCreditCartExpirationValue: [initialData.inlineInputCreditCartExpirationValue, [Validators.required, inputCreditCardExpirationValidator]],
      inlineInputWithMaskValue: [initialData.inlineInputWithMaskValue, [Validators.required]],
      inlinePrependInputPasswordValue: [initialData.inlinePrependInputPasswordValue, [Validators.required, InputPasswordValidator.default]],
      inlineAppendButtonInputValue: [initialData.inlineAppendButtonInputValue, [Validators.required]],
      inlinePrependPhoneInputValue: [initialData.inlinePrependPhoneInputValue, Validators.required],

      // Address testing
      autocompleteGooglePlacesValue: [initialData.autocompleteGooglePlacesValue],
      country: [initialData.country, Validators.required],
      city: [initialData.city, Validators.required],
      street: [initialData.street, Validators.required],
      zip_code: [initialData.zip_code, Validators.required],
      dropdownWithColor: [[], Validators.required],
      selectColor: [[], Validators.required],
    });
    const phoneControl: AbstractControl = new FormControl(
      '',
      {
        validators: [
          Validators.required,
          phoneInputValidator({ countryControl: this.form.get('country') })
        ]
      }
    );

    this.form.addControl('phoneInputValue', phoneControl);

    this.formScheme = {
      fieldsets: {
        first: [
          {
            name: 'iframeInputValue1',
            type: FormFieldType.IframeInput,
            fieldSettings: this.getFieldSettings$(),
            inputSettings: {
              placeholder: 'Iframe input 1 placeholder x',
              maxLength: 5
            }
          },
          {
            name: 'iframeInputValue2',
            type: FormFieldType.IframeInput,
            fieldSettings: this.getFieldSettings$(),
            inputSettings: {
              placeholder: 'Iframe input 2 placeholder x',
              maxLength: 6
            }
          },
          {
            name: 'iframeInputIbanValue',
            type: FormFieldType.IframeInputIban,
            fieldSettings: this.getFieldSettings$({classList: 'col-xs-12'}),
            inputIbanSettings: {
              placeholder: 'Input iframe iban filled'
            }
          },
          {
            name: 'inputValue',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$(),
            inputSettings: {
              placeholder: 'Input placeholder',
              maxLength: 2
            }
          },
          {
            name: 'inputOptionalValue',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$({required: false}),
            addonAppend: {
              addonType: AddonType.Loader
            },
            inputSettings: {
              placeholder: 'Optional input placeholder (with spinner)'
            }
          },
          {
            name: 'inputMinMaxValNumberValue',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$(),
            inputSettings: {
              type: InputType.Number,
              placeholder: 'Number input placeholder from 0 to 123 step 1',
              numberMin: 0, // Works only for 0
              numberMax: 123,
              numberIsInteger: true
            }
          },
          {
            name: 'inputMinMaxLenNumberValue',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$(),
            inputSettings: {
              type: InputType.Number,
              placeholder: 'Number input placeholder limited to 5 length',
              minLength: 3, // TODO
              maxLength: 5
            }
          },
          {
            name: 'inputPasswordValue',
            type: FormFieldType.InputPassword,
            fieldSettings: this.getFieldSettings$({classList: 'col-xs-12'})
          },
          {
            name: 'filesValue',
            type: FormFieldType.FilePicker,
            fieldSettings: this.getFieldSettings$({label: 'File input label', classList: 'col-xs-12'}),
            filePickerSettings: {
              placeholder: 'File picker placeholder',
              accept: '*',
              multiple: true,
              onValueChange: e => {},
            }
          },
          {
            name: 'selectValue',
            type: FormFieldType.Select,
            fieldSettings: this.getFieldSettings$({
              classList: 'col-xs-12',
              label: 'Select field'
            }),
            selectSettings: {
              options: [
                { label: 'First option', value: 1 },
                { label: 'Second option', value: 2 }
              ],
              placeholder: 'Select placeholder'
            }
          },
          {
            name: 'textareaValue',
            type: FormFieldType.Textarea,
            fieldSettings: this.getFieldSettings$({classList: 'col-xs-12'}),
            textareaSettings: {
              minRows: 5,
              maxRows: 5,
              placeholder: 'Textarea placeholder'
            }
          },
          {
            name: 'selectBooleanValue',
            type: FormFieldType.SelectBoolean,
            fieldSettings: this.getFieldSettings$({label: 'Select boolean field'}),
            selectBooleanSettings: {
              trueLabel: 'yes',
              falseLabel: 'no',
              placeholder: 'Select boolean placeholder'
            }
          },
          {
            name: 'checkboxValue',
            type: FormFieldType.Checkbox,
            fieldSettings: this.getFieldSettings$({label: 'Checkbox field <a href=\"https://payever.de/schufa/\" target=\"_blank\">Example link</a>'}),
            tooltipIcon: {
              tooltipMessage: 'This is tooltip'
            }
          },
          {
            name: 'radioValue',
            type: FormFieldType.Radio,
            fieldSettings: this.getFieldSettings$({classList: 'col-xs-12'}),
            radioSettings: {
              radioButtons: [
                { title: 'First radio option <a href=\"https://payever.de/schufa/\" target=\"_blank\">Example link</a>', value: 1 },
                { title: 'Second radio option', value: 2 },
                { title: 'Third radio option', value: 3 }
              ]
            }
          },
          {
            name: 'datepickerValue',
            type: FormFieldType.Date,
            fieldSettings: this.getFieldSettings$(),
            dateSettings: {
              placeholder: 'Datepicker placeholder',
              min: DatePresets.default.min,
              max: DatePresets.default.max,
              startView: DatepickerStartView.Year
            }
          },
          {
            name: 'datepickerValueMonth',
            type: FormFieldType.Date,
            fieldSettings: this.getFieldSettings$(),
            dateSettings: {
              mode: DatepickerMode.MonthYear,
              placeholder: 'Datepicker placeholder',
              min: DatePresets.default.min,
              max: DatePresets.default.max,
              startView: DatepickerStartView.Year
            }
          },
          {
            name: 'datepickerValue2',
            type: FormFieldType.Date,
            fieldSettings: this.getFieldSettings$(),
            dateSettings: {
              placeholder: 'Datepicker placeholder',
              min: DatePresets.default.min,
              max: DatePresets.default.max,
              startView: DatepickerStartView.Year
            }
          },
          {
            name: 'autocompleteGooglePlacesValue',
            type: FormFieldType.AutocompleteGooglePlaces,
            fieldSettings: this.getFieldSettings$(),
            addonPrepend: {
              addonType: AddonType.Icon,
              iconId: 'icon-geocoder-24'
            },
            autocompleteGooglePlacesSettings: {
              placeholder: 'Autocomplete google places placeholder',
              onValueChange: (event: GooglePlacesAutocompleteChangeEvent) => {
                this.address = event.address;
                this.form.get('city').setValue(event.address.city, {emitEvent: false});
                this.form.get('country').setValue(event.address.country, {emitEvent: false});
                this.form.get('street').setValue(event.address.street, {emitEvent: false});
                this.form.get('zip_code').setValue(event.address.zip_code, {emitEvent: false});
              }
            }
          },
          {
            name: 'country',
            type: FormFieldType.Select,
            fieldSettings: this.getFieldSettings$({label: 'Country'}),
            selectSettings: {
              options: this.addressService.countriesFormOptions
            },
            linkedControls: [
              {
                control: this.form.controls['autocompleteGooglePlacesValue'],
                transform: (data: any): string => {
                  this.addressService.mutateAddress(this.address, 'country', data);
                  return this.addressService.getAddressString(this.address);
                }
              }
            ]
          },
          {
            name: 'city',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$(),
            linkedControls: [
              {
                control: this.form.controls['autocompleteGooglePlacesValue'],
                transform: (data: any): string => {
                  this.addressService.mutateAddress(this.address, 'city', data);
                  return this.addressService.getAddressString(this.address);
                }
              }
            ]
          },
          {
            name: 'street',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$(),
            linkedControls: [
              {
                control: this.form.controls['autocompleteGooglePlacesValue'],
                transform: (data: any): string => {
                  this.addressService.mutateAddress(this.address, 'street', data);
                  return this.addressService.getAddressString(this.address);
                }
              }
            ]
          },
          {
            name: 'zip_code',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$(),
            linkedControls: [
              {
                control: this.form.controls['autocompleteGooglePlacesValue'],
                transform: (data: any): string => {
                  this.addressService.mutateAddress(this.address, 'zip_code', data);
                  return this.addressService.getAddressString(this.address);
                }
              }
            ]
          },
          {
            name: 'inputCurrencyValue',
            type: FormFieldType.InputCurrency,
            fieldSettings: this.getFieldSettings$(),
            addonAppend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Filled,
              text: 'USD'
            },
            inputCurrencySettings: {
              maxLength: 6,
              placeholder: 'Input currency filled'
            }
          },
          {
            name: 'inputCurrencyValue2',
            type: FormFieldType.InputCurrency,
            fieldSettings: this.getFieldSettings$(),
            addonPrepend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Default,
              text: 'USD'
            },
            inputCurrencySettings: {
              maxLength: 6,
              placeholder: 'Input currency default'
            }
          },
          {
            name: 'phoneInputValue',
            type: FormFieldType.PhoneInput,
            fieldSettings: this.getFieldSettings$({label: 'Phone'}),
            phoneInputSettings: {
              placeholder: 'Phone Input Placeholder'
            }
          },
          {
            name: 'autocompleteValue',
            type: FormFieldType.Autocomplete,
            fieldSettings: this.getFieldSettings$(),
            addonPrepend: {
              addonType: AddonType.Icon,
              iconId: 'icon-geocoder-24'
            },
            autocompleteSettings: {
              placeholder: 'Autocomplete placeholder'
            }
          },
          // For inline prepend
          {
            name: 'inlinePrependInputValue',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$(),
            addonPrepend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Filled,
              addonPrependStyle: AddonPrependStyle.Inline,
              text: 'PREFIX'
            },
            inputSettings: {
              placeholder: 'Input placeholder (inline prefix)'
            }
          },
          {
            name: 'inlinePrependAutocompleteValue',
            type: FormFieldType.Autocomplete,
            fieldSettings: this.getFieldSettings$(),
            addonPrepend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Filled,
              addonPrependStyle: AddonPrependStyle.Inline,
              text: 'PREFIX'
            },
            autocompleteSettings: {
              placeholder: 'Autocomplete placeholder (inline prefix)'
            }
          },
          {
            name: 'inlinePrependInputCurrencyValue',
            type: FormFieldType.InputCurrency,
            fieldSettings: this.getFieldSettings$(),
            addonPrepend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Filled,
              addonPrependStyle: AddonPrependStyle.Inline,
              text: 'USD'
            },
            inputCurrencySettings: {
              maxLength: 6,
              placeholder: 'Input currency filled (inline prefix)'
            }
          },
          {
            name: 'inlinePrependPhoneInputValue',
            type: FormFieldType.PhoneInput,
            fieldSettings: this.getFieldSettings$({label: 'Phone'}),
            addonPrepend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Filled,
              addonPrependStyle: AddonPrependStyle.Inline,
              text: 'PREFIX'
            },
            phoneInputSettings: {
              placeholder: 'Phone Input Placeholder (inline prefix)'
            }
          },
          {
            name: 'inlineInputIbanValue',
            type: FormFieldType.InputIban,
            fieldSettings: this.getFieldSettings$(),
            inputIbanSettings: {
              placeholder: 'Input iban filled'
            }
          },
          {
            name: 'inlineInputCreditCartNumberValue',
            type: FormFieldType.InputCreditCardNumber,
            fieldSettings: this.getFieldSettings$(),
            inputCreditCardNumberSettings: {
              placeholder: 'Input credit card number filled'
            }
          },
          {
            name: 'inlineInputCreditCartExpirationValue',
            type: FormFieldType.InputCreditCardExpiration,
            fieldSettings: this.getFieldSettings$(),
            inputCreditCardExpirationSettings: {
              placeholder: 'Input credit card expiration filled'
            }
          },
          {
            name: 'inlineInputWithMaskValue',
            type: FormFieldType.InputWithMask,
            fieldSettings: this.getFieldSettings$(),
            inputWithMaskSettings: {
              placeholder: 'Input with mask',
              mask: [/\d/, /\d/, '-', /\d/, /\d/],
              unmask: (value: string) => value.replace('-', '')
            }
          },
          {
            name: 'inlinePrependInputPasswordValue',
            type: FormFieldType.InputPassword,
            fieldSettings: this.getFieldSettings$(),
            addonPrepend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Filled,
              addonPrependStyle: AddonPrependStyle.Inline,
              text: 'PREFIX'
            }
          },
          {
            name: 'inlineAppendButtonInputValue',
            type: FormFieldType.Input,
            fieldSettings: this.getFieldSettings$({tabIndex: 1}),
            inputSettings: {
              type: InputType.Email
            },
            addonAppend: {
              addonType: AddonType.Button,
              className: 'btn btn-link btn btn-link mat-button-line-height-sm',
              text: 'Hey, mister!<br>click me',
              onClick: () => alert('Boom!!!')
            }
          },
          {
            name: 'dropdownWithColor',
            type: FormFieldType.AutocompleteChips,
            fieldSettings: this.getFieldSettings$(),
            autocompleteChipsSettings: this.autocompleteChipsSettings.asObservable()
          },
          {
            name: 'selectColor',
            type: FormFieldType.Select,
            fieldSettings: this.getFieldSettings$(),
            selectSettings: {
              options: this.colorOptions,
              multiple: true,
              panelClass: 'mat-select-dark autocomplete-panel-non-scrollable',
              singleLineMode: true,
              singleLineMoreText: 'More',
              optionClass: 'badge-checkbox',
              addOptionButton: {
                onClick(): void {
                  
                },
                name: '+ Add'
              },
            },
          }
        ]
      }
    };

    this.testFieldset = this.formScheme.fieldsets['first'];
    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: MyFormInterface): void {
    // stub method
  }

}
