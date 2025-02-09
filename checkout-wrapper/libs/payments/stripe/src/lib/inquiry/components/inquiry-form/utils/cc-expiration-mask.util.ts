export const creditCardExpirationMaskFn = (
  value: string,
  separator = '/',
): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const maskedValue = value
    .replace(/\D/g, '')
    .replace(/(.{2})/g, '$1' + separator)
    .trim()
    .slice(0, 5);

  return maskedValue;
};

export const creditCardExpirationUnmaskFn = (
  value: string,
  separator = '/',
): string => value.replace(new RegExp(`\\${separator}`, 'g'), '').slice(0, 4);
