export const isValidSwedishPIN = (pin: string) => {
  if (pin === undefined) {
    return false;
  }

  const pinArray = pin
    .replace(/\D/g, '')
    .split('')
    .reverse()
    .slice(0, 10);

  if (pinArray.length !== 10) {
    return false;
  }

  const sum = pinArray
    .map((n: string) => Number(n))
    .reduce((previous, current, index) => {
      if (index % 2) { current *= 2 }

      if (current > 9) { current -= 9 }

      return previous + current;
    });

  return 0 === sum % 10;
};

export const differenceInYears = (birthDateString: string) => {
  const birth = {
    year: birthDateString.substring(0, 4),
    month: birthDateString.substring(4, 6),
    day: birthDateString.substring(6),
  };

  const birthDate = new Date(`${birth.year}-${birth.month}-${birth.day}`);
  const differenceMs = Date.now() - birthDate.getTime();

  return Math.abs(new Date(differenceMs).getFullYear() - 1970);
};

export const isEighteen = (ssn: string) => {
  if (ssn === undefined || ssn.length !== 12) {
    return true;
  }

  const birthDate = ssn.substring(0, 8);
  const age = differenceInYears(birthDate);

  return age >= 18;
};

export const isValidCentury = (value: string) => value.startsWith('19')
  || value.startsWith('20')
  || value.startsWith('21');
