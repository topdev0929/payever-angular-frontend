import { AddressFormInterface } from '../interfaces';
import { DISABLED_ADDRESS_FIELDS } from '../settings';

export function isDisabledAddressControl(
  controlName: keyof AddressFormInterface,
  country: string,
  forceDisabled = false,
): boolean {

  if (forceDisabled) {
    return true;
  }

  const countrySettings = DISABLED_ADDRESS_FIELDS[country];

  return countrySettings ? countrySettings[controlName] : false;
}
