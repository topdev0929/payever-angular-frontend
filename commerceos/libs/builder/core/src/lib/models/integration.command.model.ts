import { PebDataSourceFilterItem } from './integration.model';


export enum PebIntegrationContextCommandType {
  PatchValue = 'context.patch',
  SetDataSourceFilter = 'context.data-source.set-filter',
  ClearDataSourceFilters = 'context.data-source.clear-filters',
}

export module PebIntegrationCommand {

  export module Context {
    export interface PatchValue {
      uniqueTag: string;
      patch: any;
    }

    export interface SetDataSourceFilter {
      uniqueTag: string;
      filter: PebDataSourceFilterItem;
      title: string;
    }

    export interface ClearDataSourceFilters {
      uniqueTag: string;
    }
  }
}