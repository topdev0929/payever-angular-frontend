import { PebContextRendererConfigs as PebContextRendererConfigs } from './context.model';
import { PebElementType, PebMap } from './element.model';
import { PebViewElementEventType } from './event.model';
import { PebIntegrationAction } from './integration.action.model';
import { PebIntegrationDataType } from './integration.data.model';
import { PebScreen, PebTheme } from './interfaces';
import { PebLanguage } from './language.model';
import { PebViewPage } from './view-state.model';

export interface PebIntegration {
  actions?: { [key in PebViewElementEventType]?: PebIntegrationAction };
  dataSource?: PebAPIDataSource;
  dataParams?: PebAPIDataSourceParams;
  contextField?: PebIntegrationContextField;
  renderConfigs?: PebContextRendererConfigs;
}

export type PebFx = string;

export type PebDynamicParams = { [key: string]: PebDynamicParams | any } | PebFx;

export type PebDataSource = PebAPIDataSource;

export interface PebIntegrationContextField {
  eval: PebFx;
  dataType: PebIntegrationDataType;
}

export enum PebIntegrationType {
  DataSource = 'data-source',
  Action = 'action',
  Group = 'group',
}

/** @deprecated */
export enum PebDataSourceTypes {
  API = 'data-source',
}

export interface PebAPIDataSource {
  uniqueTag: string;
  type: PebDataSourceTypes.API;
  title: string;
  connectorId: string;
  dataType: PebIntegrationDataType;
  /** @deprecated */
  dataSourceId: string;
  params: any;
}

export interface PebAPIDataSourceParams {
  pagination?: PebContextPagination;
  filters?: PebMap<PebDataSourceFilterObj>;
  params?: any;
}

export interface PebContextPagination {
  page: number;
  limit: number;
}

export interface PebDataSourceFilterObj {
  title: string;
  value: {
    field: string;
    fieldCondition: string;
    fieldType: string;
    value: any;
  };
}

export interface PebDataSourceFilterItem {  
  title?: string;
  field: string;
  fieldCondition: string;
  fieldType: string;
  value: any;
}

export interface PebIntegrationInput {
  dataType: PebIntegrationDataType;
  title?: string;
  defaultValue: any;
  validationRules: any[];
}

export interface PebDataSourceParamSchema {
  name: string;
  alias: string;
  dataType: PebIntegrationDataType;
}

export interface PebConnectorContext {
  screen: PebScreen;
  theme: PebTheme;
  page: PebViewPage;
  languageKey: string;
  languages: PebLanguage[];
}

export interface PebElementWithIntegration {
  id: string;
  name?: string;
  type?: PebElementType;
  parent?: { id: string; type?: PebElementType; };
  integration?: PebIntegration;
  children: PebElementWithIntegration[];
}

export const PEB_ROOT_CONTEXT_ID = 'root';
export const PEB_DEFAULT_PAGINATION: PebContextPagination = { limit: 10, page: 1 };

export function hasDataIntegration(integration: PebIntegration | undefined): boolean {
  if (!integration) {
    return false;
  }

  return !!integration.dataSource || !!integration.contextField;
}
