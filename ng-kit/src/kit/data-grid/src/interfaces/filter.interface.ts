export interface DataGridFilterInterface {
  key: string;
  value: any;
  condition: string;
}

export enum DataGridFilterType {
  Text = 'text',
  Date = 'date',
  Email = 'email',
  Number = 'number',
  Select = 'select'
}

export enum DataGridFilterCondition {
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

export interface DataGridFilterSelectOptionInterface {
  value: string;
  label: string;
}

export interface DataGridFilterSelectOptionsInterface {
  [propName: string]: DataGridFilterSelectOptionInterface[];
}

export interface DataGridCountryArrayInterface {
  code: string;
  name: string;
}

export interface DataGridFilterSchemaInterface {
  field: string;
  fieldLabel: string;
  type: DataGridFilterType;
  options?: DataGridFilterSelectOptionInterface[];
}

export interface DataGridValueRangeInterface {
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
}
