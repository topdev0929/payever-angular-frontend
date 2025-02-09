import { PebAPIDataSourceSchema, PebActionSchema, PebFieldSchema, PebIntegrationDataType } from '@pe/builder/core';

export enum IntegrationNodeType {
  Group = 'group',
  Connector = 'connector',
  Action = 'action',
  DataSource = 'data-source',
  ContextField = 'context-field'
}

export interface PebIntegrationTreeItem {
  id: string;
  title: string;
  type: IntegrationNodeType;
  children?: PebIntegrationTreeItem[];
  value?: PebAPIDataSourceSchema | PebActionSchema | PebFieldSchema;
}

export interface PebContextFieldTree {
  id: string;
  title: string;
  fullTitle: string;
  children: PebContextFieldTree[];
  value: string;
  dataType: PebIntegrationDataType;
  schema: PebFieldSchema;
  parent?: PebContextFieldTree;
}

export function hasFields(schema: PebAPIDataSourceSchema | PebFieldSchema | PebActionSchema): 
  schema is PebAPIDataSourceSchema | PebFieldSchema {
  return (schema as PebAPIDataSourceSchema)?.fields !== undefined;
}
