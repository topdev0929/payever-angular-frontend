import { Observable } from 'rxjs';

import { BaseFormScheme, BaseFormSchemeField, BaseFormSchemeFieldsets } from '../../form-core/interfaces/form-scheme.interface';
import { TooltipIconInterface, LinkedControlInterface } from '../../form-core/interfaces';
import { FormSchemeFieldType, FormFieldEnum } from '../../form-core/types';

import {
  AutocompleteChipsSettingsInterface,
  AutocompleteGooglePlacesSettingsInterface,
  AutocompleteSettingsInterface,
  ColorAutocompleteChipsSettingsInterface
} from '../../form-components/autocomplete';
import { ButtonToggleSettingsInterface } from '../../form-components/button-toggle';
import { CheckboxSettingsInterface } from '../../form-components/checkbox';
import { ColorPanelSettingsInterface, ColorPickerSettingsInterface } from '../../form-components/color-picker';
import { DatepickerSettingsInterface } from '../../form-components/datepicker';
import { ImagePickerSettingsInterface } from '../../form-components/image-picker';
import { InputCreditCardExpirationSettingsInterface } from '../../form-components/input-credit-card-expiration';
import { InputCreditCardNumberSettingsInterface } from '../../form-components/input-credit-card-number';
import { InputWithMaskSettingsInterface } from '../../form-components/input-with-mask';
import { InputCurrencySettingsInterface } from '../../form-components/input-currency';
import { InputIbanSettingsInterface } from '../../form-components/input-iban';
import { InputPasswordSettingsInterface } from '../../form-components/input-password';
import { PhoneInputSettingsInterface } from '../../form-components/phone-input';
import { RadioGroupSettingsInterface } from '../../form-components/radio';
import { SelectSettingsInterface } from '../../form-components/select';
import { SelectCountrySettingsInterface } from '../../form-components/select-country';
import { SliderSettingsInterface } from '../../form-components/slider';
import { SlideToggleSettingsInterface } from '../../form-components/slide-toggle';
import { TableGridPickerInterface } from '../../form-components/table-grid-picker';
import { TextAreaSettingsInterface } from '../../form-components/textarea';

import { AddonInterface } from '../../form-core/components/addon';
import { FilePickerSettingsInterface } from '../../form-components/file-picker';

export interface FormSchemeFieldsets extends BaseFormSchemeFieldsets<FormSchemeField> {}

export interface FormScheme extends BaseFormScheme<FormSchemeField> {}

export interface SelectBooleanSettingsInterface extends SelectSettingsInterface {
  trueLabel?: string;
  falseLabel?: string;
}

export enum FormFieldType {
  Input = FormFieldEnum.Input,
  IframeInput = FormFieldEnum.IframeInput,
  IframeInputIban = FormFieldEnum.IframeInputIban,
  InputPassword = FormFieldEnum.InputPassword,
  InputCurrency = FormFieldEnum.InputCurrency,
  InputIban = FormFieldEnum.InputIban,
  InputCreditCardNumber = FormFieldEnum.InputCreditCardNumber,
  InputCreditCardExpiration = FormFieldEnum.InputCreditCardExpiration,
  InputWithMask = FormFieldEnum.InputWithMask,
  InputSpinner = FormFieldEnum.InputSpinner,
  PhoneInput = FormFieldEnum.PhoneInput,
  Date = FormFieldEnum.Date,
  Select = FormFieldEnum.Select,
  SelectCountry = FormFieldEnum.SelectCountry,
  SelectBoolean = FormFieldEnum.SelectBoolean,
  Textarea = FormFieldEnum.Textarea,
  Radio = FormFieldEnum.Radio,
  Checkbox = FormFieldEnum.Checkbox,
  CheckboxArray = FormFieldEnum.CheckboxArray,
  Autocomplete = FormFieldEnum.Autocomplete,
  AutocompleteGooglePlaces = FormFieldEnum.AutocompleteGooglePlaces,
  AutocompleteChips = FormFieldEnum.AutocompleteChips,
  SlideToggle = FormFieldEnum.SlideToggle,
  Slider = FormFieldEnum.Slider,
  ButtonToggle = FormFieldEnum.ButtonToggle,
  ColorPicker = FormFieldEnum.ColorPicker,
  ColorPanel = FormFieldEnum.ColorPanel,
  FilePicker = FormFieldEnum.FilePicker,
  ImagePicker = FormFieldEnum.ImagePicker,
  TableGridPicker = FormFieldEnum.TableGridPicker
}

export interface FormSchemeField extends BaseFormSchemeField {
  type: FormSchemeFieldType | FormFieldType;

  tooltipIcon?: TooltipIconInterface | Observable<TooltipIconInterface>;
  addonAppend?: AddonInterface | Observable<AddonInterface>;
  addonPrepend?: AddonInterface | Observable<AddonInterface>;
  linkedControls?: LinkedControlInterface[] | Observable<LinkedControlInterface[]>;

  autocompleteChipsSettings?: AutocompleteChipsSettingsInterface | Observable<AutocompleteChipsSettingsInterface> |
    ColorAutocompleteChipsSettingsInterface | Observable<ColorAutocompleteChipsSettingsInterface>;
  autocompleteGooglePlacesSettings?: AutocompleteGooglePlacesSettingsInterface | Observable<AutocompleteGooglePlacesSettingsInterface>;
  autocompleteSettings?: AutocompleteSettingsInterface | Observable<AutocompleteSettingsInterface>;
  buttonToggleSettings?: ButtonToggleSettingsInterface | Observable<ButtonToggleSettingsInterface>;
  checkboxSettings?: CheckboxSettingsInterface | Observable<CheckboxSettingsInterface>;
  checkboxArraySettings?: CheckboxSettingsInterface[] | Observable<CheckboxSettingsInterface[]>;
  colorPickerSettings?: ColorPickerSettingsInterface | Observable<ColorPickerSettingsInterface>;
  colorPanelSettings?: ColorPanelSettingsInterface | Observable<ColorPanelSettingsInterface>;
  dateSettings?: DatepickerSettingsInterface | Observable<DatepickerSettingsInterface>;
  filePickerSettings?: FilePickerSettingsInterface | Observable<FilePickerSettingsInterface>;
  imagePickerSettings?: ImagePickerSettingsInterface | Observable<ImagePickerSettingsInterface>;
  inputCreditCardNumberSettings?: InputCreditCardNumberSettingsInterface | Observable<InputCreditCardNumberSettingsInterface>;
  inputWithMaskSettings?: InputWithMaskSettingsInterface | Observable<InputWithMaskSettingsInterface>;
  inputCreditCardExpirationSettings?: InputCreditCardExpirationSettingsInterface | Observable<InputCreditCardExpirationSettingsInterface>;
  inputCurrencySettings?: InputCurrencySettingsInterface | Observable<InputCurrencySettingsInterface>;
  inputIbanSettings?: InputIbanSettingsInterface | Observable<InputIbanSettingsInterface>;
  inputPasswordSettings?: InputPasswordSettingsInterface | Observable<InputPasswordSettingsInterface>;
  phoneInputSettings?: PhoneInputSettingsInterface | Observable<PhoneInputSettingsInterface>;
  radioSettings?: RadioGroupSettingsInterface | Observable<RadioGroupSettingsInterface>;
  selectSettings?: SelectSettingsInterface | Observable<SelectSettingsInterface>;
  selectCountrySettings?: SelectCountrySettingsInterface | Observable<SelectCountrySettingsInterface>;
  selectBooleanSettings?: SelectBooleanSettingsInterface | Observable<SelectBooleanSettingsInterface>;
  slideToggleSettings?: SlideToggleSettingsInterface | Observable<SlideToggleSettingsInterface>;
  sliderSettings?: SliderSettingsInterface | Observable<SliderSettingsInterface>;
  tableGridPickerSettings?: TableGridPickerInterface | Observable<TableGridPickerInterface>;
  textareaSettings?: TextAreaSettingsInterface | Observable<TextAreaSettingsInterface>;
}
