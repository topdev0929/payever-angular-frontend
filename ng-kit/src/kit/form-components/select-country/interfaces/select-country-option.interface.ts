export interface SelectCountryOptionInterface {
  label: string;
  value: any;
  type: 'option' | 'group';
  items?: SelectCountryOptionInterface[];
}
