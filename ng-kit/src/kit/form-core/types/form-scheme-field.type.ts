/* @deprecated - use FormFieldType instead */
export type FormSchemeFieldType = 'input' |
                                  'input-currency' |
                                  'input-iban' |
                                  'input-credit-card-number' |
                                  'input-credit-card-expiration' |
                                  'input-password' |
                                  'input-spinner' |
                                  'phone-input' |
                                  'date' |
                                  'select' |
                                  'select-country' |
                                  'select-boolean' |
                                  'textarea' |
                                  'radio' |
                                  'checkbox' |
                                  'checkbox-array' |
                                  'autocomplete' |
                                  'autocomplete-google-places' |
                                  'autocomplete-chips' |
                                  'slide-toggle' |
                                  'slider' |
                                  'button-toggle' |
                                  'color-picker' |
                                  'color-panel' |
                                  'file-picker' |
                                  'image-picker' |
                                  'table-grid-picker';

export enum FormFieldEnum {
  Input = 'input',
  IframeInput = 'iframe-input',
  IframeInputIban = 'iframe-input-iban',
  InputCurrency = 'input-currency',
  InputIban = 'input-iban',
  InputCreditCardNumber = 'input-credit-card-number',
  InputCreditCardExpiration = 'input-credit-card-expiration',
  InputWithMask = 'input-with-mask',
  InputPassword = 'input-password',
  InputSpinner = 'input-spinner',
  PhoneInput = 'phone-input',
  Date = 'date',
  Select = 'select',
  SelectCountry = 'select-country',
  SelectBoolean = 'select-boolean',
  Textarea = 'textarea',
  Radio = 'radio',
  Checkbox = 'checkbox',
  CheckboxArray = 'checkbox-array',
  Autocomplete = 'autocomplete',
  AutocompleteGooglePlaces = 'autocomplete-google-places',
  AutocompleteChips = 'autocomplete-chips',
  SlideToggle = 'slide-toggle',
  Slider = 'slider',
  ButtonToggle = 'button-toggle',
  ColorPicker = 'color-picker',
  ColorPanel = 'color-panel',
  FilePicker = 'file-picker',
  ImagePicker = 'image-picker',
  TableGridPicker = 'table-grid-picker'
}
