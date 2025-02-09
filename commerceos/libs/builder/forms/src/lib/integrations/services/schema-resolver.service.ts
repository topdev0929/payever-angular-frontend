import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  PebAPIDataSource,
  PebAPIDataSourceSchema,
  PebContextFieldKey,    
  PebFieldSchema,
  PebIntegrationDataType,
  evaluate,
} from '@pe/builder/core';
import { PebConnectorProxyService } from '@pe/builder/integrations';
import { PebElement, getDefaultContextField } from '@pe/builder/render-utils';
import { PebElementsState } from '@pe/builder/state';

@Injectable({ providedIn: 'any' })
export class PebSchemaResolverService {
  constructor(
    private store: Store,
    private connectorService: PebConnectorProxyService,
  ) { }

  getElementContextSchema$(element: PebElement, evalContextField: string): Observable<PebFieldSchema[]> {
    if (!element) {
      return of([]);
    }

    const integration = element.integration;
    if (!integration?.dataSource && !evalContextField) {
      const parent = this.getParentElement(element);
      const parentEval = parent.integration?.contextField?.eval || getDefaultContextField(parent)?.eval;

      return this.getElementContextSchema$(parent, parentEval);
    }

    if (integration.dataSource) {
      return this.getDataSourceSchema$(integration.dataSource).pipe(
        map((dataSourceSchema) => {
          if (!dataSourceSchema) {
            return [];
          }
          const contextFields = this.getContextFieldsOfDataSource(dataSourceSchema);
          if (!evalContextField) {
            return contextFields;
          }

          const selectedField = this.evaluateContextFieldsSchema(contextFields, evalContextField);

          return this.getContextFieldsOfField(selectedField);
        }),
      );
    }

    const parent = this.getParentElement(element);
    const parentEval = parent.integration?.contextField?.eval || getDefaultContextField(parent)?.eval;


    return this.getElementContextSchema$(parent, parentEval).pipe(
      map((fieldsSchema: PebFieldSchema[]) => {
        const selectedField = this.evaluateContextFieldsSchema(fieldsSchema, evalContextField);
        const contextFields = this.getContextFieldsOfField(selectedField);

        return contextFields;
      }),
    );
  }

  getContextFieldsOfDataSource(schema: PebAPIDataSourceSchema): PebFieldSchema[] {
    const result: PebFieldSchema[] = [];
    let value = {
      name: PebContextFieldKey.Value,
      title: 'Value',
      dataType: schema.dataType,
      fields: schema.fields,
    };

    result.push(value);

    if (schema.dataType === PebIntegrationDataType.Table || schema.dataType === PebIntegrationDataType.Array) {
      value.fields = [];
      value.dataType = PebIntegrationDataType.Table;

      result.push({
        name: PebContextFieldKey.ListItem,
        title: 'List Item',
        dataType: PebIntegrationDataType.Object,
        fields: schema.fields,
      });

      result.push({
        name: PebContextFieldKey.Length,
        title: 'Length',
        dataType: PebIntegrationDataType.Number,
      });
    }

    if (schema.dataType === PebIntegrationDataType.Table) {            
      result.push({
        name: PebContextFieldKey.Filters,
        title: 'Filters',
        dataType: PebIntegrationDataType.Object,
        fields: schema.filters || [],
      });

      result.push({
        name: PebContextFieldKey.Pagination,
        title: 'Pagination',
        dataType: PebIntegrationDataType.Object,
        fields: [
          {
            name: 'page',
            title: 'Page',
            dataType: PebIntegrationDataType.Number,
          },
          {
            name: 'pages',
            title: 'Pages',
            dataType: PebIntegrationDataType.Array,
          },
        ],
      });

      result.push({
        name: PebContextFieldKey.list,
        title: 'List',
        dataType: PebIntegrationDataType.Array,
        fields: schema.fields,
      });
    }

    result.push({
      name: PebContextFieldKey.HasValue,
      title: 'Has Value',
      dataType: PebIntegrationDataType.Boolean,
    });

    return result;
  }

  getContextFieldsOfField(schema: PebFieldSchema): PebFieldSchema[] {
    const dataType = schema.dataType;
    const result: PebFieldSchema[] = [];

    const value = {
      name: PebContextFieldKey.Value,
      title: 'Value',
      dataType,
      fields: schema.fields ?? [],
    };
    result.push(value);

    if (schema.dataType === PebIntegrationDataType.Table || schema.dataType === PebIntegrationDataType.Array) {
      value.fields = [];

      result.push({
        name: PebContextFieldKey.ListItem,
        title: 'List Item',
        dataType: PebIntegrationDataType.Object,
        fields: schema.fields,
      });

      result.push({
        name: PebContextFieldKey.Length,
        title: 'Length',
        dataType: PebIntegrationDataType.Number,
      });
    }

    if (dataType === PebIntegrationDataType.Table) {
      result.push({
        name: PebContextFieldKey.list,
        title: 'List',
        dataType: PebIntegrationDataType.Array,
        fields: schema.fields,
      });
    }

    result.push({
      name: PebContextFieldKey.HasValue,
      title: 'Has Value',
      dataType: PebIntegrationDataType.Boolean,
    });

    return result;
  }

  evaluateContextFieldsSchema(fields: PebFieldSchema[], evalStr: string): PebFieldSchema {
    const schema = { fields, title: '', dataType: PebIntegrationDataType.Null, name: '' };
    if (!evalStr) {
      return schema;
    }
    const schemaInfo = this.toSchemaInfoObj(schema);
    const val = evaluate(evalStr, schemaInfo);

    return val?.fieldSchema$;
  }

  getDataSourceSchema$(dataSource: PebAPIDataSource): Observable<PebAPIDataSourceSchema | undefined> {
    const connector = this.getConnector(dataSource.connectorId);
    if (!connector) {
      return of(undefined);
    }

    return connector.getDataSources().pipe(
      map((dataSources: PebAPIDataSourceSchema[]) => {
        return dataSources.find(ds => ds.uniqueTag === dataSource.uniqueTag);
      }),
    );
  }

  private getConnector(connectorId: string | undefined) {
    return this.connectorService.getConnector(connectorId);
  }

  private getParentElement(element: PebElement): PebElement | undefined {
    const parentId = element?.parent?.id;
    if (!parentId) {
      return undefined;
    }

    const elements = this.store.selectSnapshot(PebElementsState.allElements);
    const parent = elements.find(elm => elm.id === parentId);

    return parent;
  }

  private toSchemaInfoObj(schema: PebFieldSchema): SchemaInfoObj {
    const obj = { fieldSchema$: schema as PebFieldSchema };
    (schema.fields ?? []).forEach(field => obj[field.name] = this.toSchemaInfoObj(field));

    return obj;
  }
}

interface SchemaInfoObj {
  fieldSchema$: PebFieldSchema;
  [key: string]: SchemaInfoObj | any;
}
