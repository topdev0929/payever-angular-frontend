export const uniquePageName = (value: string, values: string[]) => {
  const matches = /\((\d+)\)$/.exec(value);
  if (matches) {
    const n = parseInt(matches[1]);

    return value.replace(/\(\d+\)$/, `(${n + 1})`);
  }

  if (values.some(v => v === value)) {
    return `${value} (1)`;
  }

  return value;
};

export function toTitleCase(str: string | undefined): string {
  if (str === undefined) {
    return '';
  }

  return str.replace(
    /(\w*\W*|\w*)\s*/g,
    (txt: string) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

export function toCamelCase(txt: string): string {
  return txt.charAt(0).toUpperCase() + txt.substring(1);
}