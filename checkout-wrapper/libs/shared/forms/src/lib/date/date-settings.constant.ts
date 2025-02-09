import { DateFormat, LocaleDateFormat } from './date-format.interface';

const separator = normalize($localize`:@@ui.date_settings.separator:/`);
const dayChar = normalize($localize`:@@ui.date_settings.dayChar:D`);
const monthChar = normalize($localize`:@@ui.date_settings.monthChar:M`);
const yearChar = normalize($localize`:@@ui.date_settings.yearChar:Y`);

export const DATE_SETTINGS: LocaleDateFormat = {
  fullDate: DateFormatFactory('DD/MM/YYYY'),
  shortDate: DateFormatFactory('MM/YYYY'),
};

export const dateFormat = (dateInput: string) => ({
  parse: {
    dateInput,
  },
  display: {
    dateInput,
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
});

function DateFormatFactory(template: string): DateFormat {
  const format = template.replace(/\//g, separator);
  const table: { [key: string]: string } = {
    D: dayChar,
    M: monthChar,
    Y: yearChar,
  };

  const placeholder = format.replace(/[DMY]/g, char => table[char] || char);
  const pattern = template.replace(/[DMY]+/g, group => `\\d{${group.length}}`)
    .replace(/\//g, () => `\\${separator}`);
  
  return {
    format,
    placeholder,
    pattern: new RegExp(`^${pattern}$`),
    separator,
  };
}

function normalize(string: string) {
  // we slice to ensure the length of the string is 1.
  return string.trim().slice(0, 1);
}
