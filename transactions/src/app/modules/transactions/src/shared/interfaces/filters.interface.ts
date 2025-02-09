import { CountryArrayInterface } from './address.interface';
import { FiltersFieldType, FiltersTypeType, FiltersConditionType, FiltersOptionsSourcesType } from './filters.type';
import { SearchFilterInterface } from './list.interface';

export interface FilterOptionInterface {
  key?: string;
  id?: string;
  name: string;
}

export interface FilterOptionsInterface {
  [propName: string]: (string|FilterOptionInterface)[];
}
