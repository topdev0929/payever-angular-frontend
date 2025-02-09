export const creditCardMaskFn = (
  value: string,
  separator = ' ',
): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const maskedValue = value
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1' + separator)
    .trim()
    .slice(0, 19);

  return maskedValue;
};

export const creditCardUnmaskFn = (
  value: string,
  separator = ' ',
): string => value.replace(new RegExp(`\\${separator}`, 'g'), '').slice(0, 16);
