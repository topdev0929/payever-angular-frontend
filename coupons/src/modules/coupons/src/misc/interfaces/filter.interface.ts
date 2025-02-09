export interface FormattedFilter {
  field: string;
  fieldType: 'string' | 'number';
  fieldCondition: string;
  value: string;
  valueIn?: string;
}

export interface Filter {
  key: string;
  value: string | number | number[] | string[];
  condition?: string;
}

export enum FieldFilterKey {
  Id = 'id',
  Name = 'name',
  Price = 'price',
  Channel = 'channel',
  Category = 'category',
  Collections = 'collections',
  VariantName= 'variant_name',
}
