import {
  PebAPIDataSource,
  PebAPIDataSourceParams,
  PebDataSourceTypes,
  PebDynamicParams,
  PebIntegration,
  PebIntegrationDataType,
  PebIntegrationInput,
  PebMap,
  PebPositionType,
} from '.';

export interface PebContextRendererConfigs {
  [PebContextRendererType.Image]?: PebDynamicParams;
  [PebContextRendererType.Link]?: PebDynamicParams;
  [PebContextRendererType.Text]?: PebDynamicParams;
  [PebContextRendererType.Display]?: { hidden: boolean; positionType?: PebPositionType; };
  [PebContextRendererType.Clone]?: PebContextCloneConfig;
  [PebContextRendererType.BackgroundColor]?: PebDynamicParams;
  [PebContextRendererType.Placeholder]?: PebDynamicParams;
}

export interface PebContextCloneConfig {
  originalElementId: string;
  cloneId?: string;
  parentElementId: string;
  positioning?: { type: PebClonePositioningType };
}

export enum PebClonePositioningType {
  None = 'none',
  Array = 'array',
}

export interface PebAPIDataSourceSchema {
  connectorId: string;
  id: string;
  type: PebDataSourceTypes.API;
  dataType: PebIntegrationDataType;
  title: string;
  uniqueTag: string; 
  filterUniqueTag?: string;  
  fields: PebFieldSchema[];
  filters?: PebFieldSchema[];
  inputs: PebIntegrationInput[];
  defaultParams: PebDynamicParams;
}

export interface PebFieldSchema {  
  name: string;
  title: string;
  dataType: PebIntegrationDataType;
  fields?: PebFieldSchema[];
}

export interface PebFormFieldSchema extends PebFieldSchema{
  uniqueTag: string;
  previousField?: string;
}

export enum PebContextRendererType {
  Clone = 'clone',
  Image = 'image',
  Link = 'link',
  Placeholder = 'placeholder',
  Display = 'display',
  Text = 'text',
  BackgroundColor = 'backgroundColor',
}

export interface PebContext {  
  id?: string;
  index: number;
  name?: string;
  integration?: PebIntegration
  uniqueTag?: string;
  root?: PebRootContext;
  parent?: PebContext;
  value?: any;
  dataType?: PebIntegrationDataType;
  dataParams?: PebAPIDataSourceParams;
  renderConfigs: PebContextRendererConfigs;
  fields: { [key in PebContextFieldKey]?: any };
}

export interface PebUniqueContext {
  uniqueTag?: string;
  value?: any;
  dataType?: PebIntegrationDataType;
  dataSource: PebAPIDataSource;
  dataParams?: PebAPIDataSourceParams;
}

export enum PebContextFieldKey {
  None = '',
  Value = 'value',
  ListItem = 'listItem',
  Length = 'length',
  Filters = 'filters',
  Index = 'index',
  Pagination = 'pagination',
  Sorting = 'sorting',
  HasValue = 'hasValue',
  list = 'list',
  Root = 'root',
  ParentValue = 'parentValue',
  OriginalData = 'originalData',
}

export interface PebContextTree extends PebContext {
  children: PebContextTree[];
}

export interface PebRootContext {
  id?: string;
  urlParameters?: any;
  children: PebContextTree[];
  uniqueContexts: PebMap<PebUniqueContext>;
}
