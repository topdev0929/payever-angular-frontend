import { AbstractControl, ValidatorFn } from '@angular/forms';
import iban from 'iban';

const urlSegmentRegExp = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
const leadingZerosRegExp = (value: string) => value.length > 1 ? /^0+/.test(value) : false;

export class PeCustomValidators {
  static readonly ibanValidator = (control: AbstractControl) => {
    return iban.isValid(control.value) ? null : { incorrectIban: true };
  }

  // Domain name validator
  static readonly DomainName = (subdomains?: boolean) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const regExp = subdomains
        ? /^(?!.* .*)(?:[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/
        : urlSegmentRegExp;

      if (!control.value || control.value.length < 3 && regExp.test(control.value)) {
        return { minLengthDomainName: true };
      }
      if (!regExp.test(control.value)) {
        return { incorrectDomainName: true }
      }

      return null;
    };
  }

  // Array length validator
  static readonly MinArrayLength = (min: number) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const valid = control.value.length >= min;

      return valid
        ? null
        : { minLengthArray: true };
    };
  }

  // Positive number validator
  static readonly PositiveNumber = (min: number, greater?: boolean) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const value = control.value
        ? control.value.toString()
        : control.value;
      const valid = !value
        || !value.includes(' ')
        && !leadingZerosRegExp(value)
        && value === Number(value).toString()
        && (greater ? Number(value) > min : Number(value) >= min);

      return valid
        ? null
        : { notPositiveNumber: true };
    };
  }

  // Positive integer validator
  static readonly PositiveInteger = (min: number, greater?: boolean) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const value = control.value
        ? control.value.toString()
        : control.value;
      const valid = !value
        || !value.includes(' ')
        && !leadingZerosRegExp(value)
        && Number.isInteger(Number(value))
        && (greater ? Number(value) > min : Number(value) >= min);

      return valid
        ? null
        : { notPositiveInt: true };
    };
  }

  static readonly HexValidator: ValidatorFn = (control: AbstractControl) => {
    return /^#([0-9a-fA-F]{6})$/i.test(control.value || '') ? null : { badHex: true };
  };

  // Url segment validator
  static readonly SegmentOfUrl = (minLength = 0, maxLength = 60) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const value = control.value ?? '';

      if (value.length < minLength && urlSegmentRegExp.test(value)) {
        return { minSegmentLength: true };
      }
      if (value.length > 0 && !urlSegmentRegExp.test(value)) {
        return { incorrectSegmentName: true };
      }
      if (value.length > maxLength) {
        return { maxSegmentLength: true }
      }

      return null;
    };
  }

 static readonly NoWhiteSpace = (control: AbstractControl): { [key: string]: boolean } => {
    const cRegex = /^(\s+\S+\s*)*(?!\s).*$/;
    if (cRegex.test(control.value || '' )) {
      return null;
   }

   return (
    { whitespace: true }
   );
}}
