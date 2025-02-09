export interface PebIntegrationData {
  dataType: PebIntegrationDataType;
  value?: PebIntegrationTableDataModel | any;
}

export enum PebIntegrationDataType {
  Null = 'null',
  UUID = 'uuid',
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Object = 'object',
  Date = 'date',
  Time = 'time',
  ImageUrl = 'image-url',
  Table = 'table',
  Url = 'url',
  Array = 'array',
  Color = 'color',
}

export interface PebIntegrationTableDataModel {
  page: number;
  skip: number;
  take: number;
  total: number;
  value: any[];
}

export module PebIntegrationDataModels {
  export interface Table {
    page: number;
    skip: number;
    take: number;
    total: number;
    value: any[];
  }

  export interface ArrayItem {
    id: string;
    [key: string]: any;
  }

  export type Array = ArrayItem[];
}

