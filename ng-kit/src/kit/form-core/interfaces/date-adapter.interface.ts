export interface DateAdapterInterface {
  format(date: Date): string;
  parse(value: string): Date | null;
}
