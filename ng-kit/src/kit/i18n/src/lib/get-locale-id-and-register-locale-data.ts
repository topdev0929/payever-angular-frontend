import { registerLocaleData } from './register-locale-data';
import { getLocaleId } from './get-locale-id';

export function getLocaleIdAndRegisterLocaleData(lang: string): string {
  registerLocaleData(lang); // NOTE: be curious! Side effect here
  return getLocaleId(lang);
}
