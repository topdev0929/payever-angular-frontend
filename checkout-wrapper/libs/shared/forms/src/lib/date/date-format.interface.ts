

export interface DateFormat {
  format: string;
  pattern: RegExp;
  separator: string;
  placeholder: string;
}

export interface LocaleDateFormat {
  fullDate: DateFormat;
  shortDate: DateFormat;
}