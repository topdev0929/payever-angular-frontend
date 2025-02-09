import { PeGridSortingDirectionEnum } from '../enums';

export enum PeFilterConditions { // TODO Move to @pe/common
  Is = 'is',
  IsIn = 'isIn',
  IsNot = 'isNot',
  IsNotIn = 'isNotIn',
  IsDate = 'isDate',
  IsNotDate = 'isNotDate',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Contains = 'contains',
  DoesNotContain = 'doesNotContain',
  // DynamicTypes:
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
  Between = 'between',
  AfterDate = 'afterDate',
  BeforeDate = 'beforeDate',
  BetweenDates = 'betweenDates'
}

export enum PeFilterType { // TODO Take as PeDataGridFilterItemType from @pe/common
  String = 'string',
  Date = 'date',
  Option = 'option',
  Number = 'number',
  Time = 'time'
}

type PeFilterChangeValueType = Date | string | number

export interface PeFilterChange {
  filter: string;
  contain: PeFilterConditions;
  search: PeFilterChangeValueType | { from: PeFilterChangeValueType, to: PeFilterChangeValueType };
  disableRemoveOption?: boolean;
}

export interface PeGridSearchFilterInterface {
  condition: PeFilterConditions | string;
  value: any;
}

export interface PeGridSearchFiltersInterface {
  [propName: string]: PeGridSearchFilterInterface[];
}

export interface PeGridSearchDataInterface {
  configuration?: PeGridSearchFiltersInterface;
  direction?: PeGridSortingDirectionEnum;
  orderBy?: string;
  page?: number;
  perPage?: number;
}
