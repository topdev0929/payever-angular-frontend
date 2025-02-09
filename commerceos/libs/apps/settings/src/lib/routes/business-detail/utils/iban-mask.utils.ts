export const ibanMaskFn = (value: string): string => {
  if (!value) {
    return value;
  }

  let formattedValue = value.split(' ').join('');
  const alpha = /[a-zA-Z]/;
  const numeric = /\d/;
  const alphaNumeric = /[a-zA-Z\d]/;
  const re = [
    alpha, alpha, numeric, numeric,
    alphaNumeric, alphaNumeric, alphaNumeric, alphaNumeric,
    alphaNumeric, alphaNumeric, alphaNumeric, alphaNumeric,
    alphaNumeric, alphaNumeric, alphaNumeric, alphaNumeric,
    alphaNumeric, alphaNumeric, alphaNumeric, alphaNumeric,
    alphaNumeric, alphaNumeric, alphaNumeric, alphaNumeric,
    alphaNumeric, alphaNumeric, alphaNumeric, alphaNumeric,
    alphaNumeric, alphaNumeric, alphaNumeric, alphaNumeric,
    alphaNumeric, alphaNumeric, alphaNumeric, alphaNumeric,
  ];

  const invalidCharIdx = formattedValue
    .split('')
    .findIndex((char, i) => !re[i].exec(char));

  if (invalidCharIdx !== -1) {
    formattedValue = formattedValue.slice(0, invalidCharIdx);
  }

  const bban = formattedValue.slice(4)?.match(/.{1,4}/g)?.slice(0, 10).join(' ').toUpperCase() ?? '';
  const countryCode = formattedValue.slice(0, 2).toUpperCase() ?? '';
  const checkDigits = formattedValue.slice(2, 4) ?? '';

  return (countryCode + ' ' + checkDigits + ' ' + bban)?.trim();
};


export const ibanUnmaskFn = (value: string) => value?.split(' ').join('') ?? '';
