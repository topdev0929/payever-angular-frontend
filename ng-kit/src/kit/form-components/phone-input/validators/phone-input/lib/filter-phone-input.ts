const allowedValuesToRemove: RegExp = /[\(\)\-\s]/gm;

export function filterPhoneInput(value: string): string {
  return (value || '').replace(allowedValuesToRemove, '').trim();
}
