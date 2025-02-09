import { AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateService } from '../i18n/src/services/translate';

// @dynamic
export class PeValidators {

  /**
   * Validator disallow to enter string with only spaces
   * @returns {(control: AbstractControl) => void}
   */
  static notEmptyStringValidator(translateService?: TranslateService, errorMessage?: string): (control: AbstractControl) => void {
    return (control: AbstractControl): ValidationErrors => {
      const value: string = control.value;
      let errors: ValidationErrors;
      if ( !value || (value && value.toString().trim() === '')) {
        let errorMessageValue: string = ''; // error message set by form fieldset component
        if (translateService) {
          errorMessageValue = translateService.translate('ng_kit.forms.error.validator.required_full');
        } else if (errorMessage) {
          errorMessageValue = errorMessage;
        }
        errors = { required: errorMessageValue };
      }
      return errors;
    };
  }

  /**
   * Validate that the field matches a valid email with domain pattern
   * @returns {(control: AbstractControl) => void}
   */
  static validEmailWithDomain(translateService?: TranslateService, errorMessage?: string): (control: AbstractControl) => void {
    return (control: AbstractControl): ValidationErrors => {
      const value: string = control.value;
      let errors: ValidationErrors;
      const EMAIL_REGEXP: RegExp = /[a-zA-Z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/g;
      if (value && value.length > 0 && !EMAIL_REGEXP.test(value)) {
        let errorMessageValue: string = ''; // error message set by form fieldset component
        if (translateService) {
          errorMessageValue = translateService.translate('ng_kit.forms.error.validator.email');
        } else if (errorMessage) {
          errorMessageValue = errorMessage;
        }
        errors = { email: errorMessageValue };
      }
      return errors;
    };
  }

    /**
   * Validate that the field matches a valid SKU pattern
   * @returns {(control: AbstractControl) => void}
   */
  static validSKU(translateService?: TranslateService, errorMessage?: string): (control: AbstractControl) => void {
    return (control: AbstractControl): ValidationErrors => {
      const SKU_REGEXP: RegExp = /^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/g;
      const value: string = control.value;
      let errors: ValidationErrors;
      if (value && value.length > 0 && !SKU_REGEXP.test(value)) {
        let errorMessageValue: string = ''; // error message set by form fieldset component
        if (translateService) {
          errorMessageValue = translateService.translate('ng_kit.forms.error.validator.sku');
        } else if (errorMessage) {
          errorMessageValue = errorMessage;
        }
        errors = { SKU: errorMessageValue };
      }
      return errors;
    };
  }

}
