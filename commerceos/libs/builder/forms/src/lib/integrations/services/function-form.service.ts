import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import {
  PebActionSchema,
  PebAPIDataSource,
  PebAPIDataSourceSchema,
  PebIntegration,
  PebDesign,
  PebElementType,
  PebDesignType,
  PebContextTableDesign,
  PebNoRenderDesign,
  PebViewElementEventType,
  PebContextRendererType,
  PebIntegrationDataType,
  PebContextRendererConfigs,
  PebDynamicParams,
} from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';

import { PebContextFieldTree } from '../models';

@Injectable({ providedIn: 'any' })
export class PebFunctionFormService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  rendererMap: { [key: string]: PebContextRendererType } = {
    [PebIntegrationDataType.UUID]: PebContextRendererType.Text,
    [PebIntegrationDataType.String]: PebContextRendererType.Text,
    [PebIntegrationDataType.Number]: PebContextRendererType.Text,
    [PebIntegrationDataType.Boolean]: PebContextRendererType.Text,
    [PebIntegrationDataType.Date]: PebContextRendererType.Text,
    [PebIntegrationDataType.Time]: PebContextRendererType.Text,
    [PebIntegrationDataType.ImageUrl]: PebContextRendererType.Image,
    [PebIntegrationDataType.Color]: PebContextRendererType.BackgroundColor,
  };

  constructor(
    private store: Store,
  ) {
  }

  setFieldSchema(schema: PebContextFieldTree): Observable<any> {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    if (elements?.length !== 1) {
      return;
    }

    return this.updateIntegration(
      {
        contextField: {
          eval: schema.value,
          dataType: schema.dataType,
        },
      },
      { contextField: schema.fullTitle },
    );
  }

  setDataSourceSchema(schema: PebAPIDataSourceSchema): Observable<any> {
    const dataSource: PebAPIDataSource = schema === undefined
      ? undefined
      : {
        connectorId: schema.connectorId,
        dataSourceId: schema.id,
        type: schema.type,
        dataType: schema.dataType,
        title: schema.title,
        uniqueTag: schema.uniqueTag,
        params: this.getDataSourceParams(schema),
      };

    return this.updateIntegration(
      { dataSource: dataSource, contextField: undefined },
      { dataSource: schema.title, contextField: undefined },
    );
  }

  setAction(schema: PebActionSchema, event: PebViewElementEventType): Observable<any> {
    return this.updateIntegration(
      { actions: { [event]: schema } },
      { action: schema.title },
    );
  }

  removeIntegration(): Observable<any> {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const integrationPayload = elements.map(elm => ({ id: elm.id, integration: undefined }));
    const designPayload = [];
    elements.forEach(elm => this.getDesignPayload(elm, false).forEach(pay => designPayload.push(pay)));

    return this.store.dispatch(new PebUpdateAction([...designPayload, ...integrationPayload]));
  }

  removeActions() {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = elements.map(elm => ({
      id: elm.id,
      data: {
        integrationTitles: { action: undefined },
      },
      integration: { actions: undefined },
    }));

    return this.store.dispatch(new PebUpdateAction(payload));
  }

  removeDataSource() {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = elements.map(elm => ({
      id: elm.id,
      data: {
        integrationTitles: { dataSource: undefined, contextField: undefined },
      },
      integration: { dataSource: undefined, contextField: undefined },
    }));

    return this.store.dispatch(new PebUpdateAction(payload));
  }

  removeContextField() {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = elements.map(elm => ({
      id: elm.id,
      data: {
        integrationTitles: { contextField: undefined },
      },
      integration: { contextField: undefined },
    }));

    return this.store.dispatch(new PebUpdateAction(payload));
  }

  removeIntegrationByType(dataTypes: string[]): Observable<any> {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const integrationPayload = elements.map((elm) => {
      const integrationUpdate = {};
      dataTypes.forEach((key)=>{
        integrationUpdate[key] = undefined;
      });
      const integration = { ...elm.integration, ...integrationUpdate };
      const { actions, dataSource } = integration;

      return { id: elm.id,
        integration: !actions && !dataSource
        ? undefined
        : integrationUpdate,
      };
    });
    const designPayload = [];
    elements.forEach(elm => this.getDesignPayload(elm, false).forEach(pay => designPayload.push(pay)));

    return this.store.dispatch(new PebUpdateAction([...designPayload, ...integrationPayload]));
  }

  getIntegrationTitle(elements: PebElement[]): string {
    const element = elements[0];
    const titles = element.data.integrationTitles;
    if (!titles) {
      return '';
    }

    const action = titles.action ? `Action : ${titles.action}` : '';
    const data = titles.dataSource ? `Data : ${titles.dataSource}` : '';
    const field = titles.contextField ? `Field : ${titles.contextField}` : '';

    return [action, data, field].filter(Boolean).join(' | ');
  }

  private updateIntegration(
    integration: Partial<PebIntegration>,
    integrationTitles: { action?: string; dataSource?: string; contextField?: string },
  ): Observable<any> {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    if (elements.length > 1) {
      return;
    }
    const [elm] = elements;
    if (elm.parent?.type === PebElementType.Grid) {
      return;
    }

    const renderConfigs = this.getRendererConfigs(integration);
    const payload = [
      {
        id: elm.id,
        data: { integrationTitles },
        integration: { ...elm.integration, ...integration, renderConfigs },
      },
      ...this.getDesignPayload(elm, true),
    ];

    this.store.dispatch(new PebUpdateAction(payload));
  }

  private getDesignPayload(element: PebElement, contextEnabled: boolean)
    : { id: string, design: PebDesign, integration?: PebIntegration }[] {
    if (element?.type !== PebElementType.Grid) {
      return [];
    }

    const children = [...element.children];
    const originalChildren = children.filter(elm => !elm.original?.id) || [];
    const templateCellId = originalChildren[0].id;
    const tableDesign = element.design as PebContextTableDesign;

    if (contextEnabled) {
      return [
        {
          id: element.id,
          design: {
            type: PebDesignType.ContextTable,
            templateCell: originalChildren[0]?.id,
            emptyCellMode: 'hide',
            originalCells: tableDesign?.originalCells ?? originalChildren.map(elm => elm.id),
          },
        },
        {
          id: templateCellId,
          design: { type: PebDesignType.ContextTableCell, table: element.id },
          integration: { renderConfigs: { placeholder: {} } },
        },
        ...originalChildren.filter(elm => elm.id !== templateCellId).map(elm => ({
          id: elm.id,
          design: { type: PebDesignType.NoRender } as PebNoRenderDesign,
        })),
      ];
    }
    else {
      return [
        { id: element.id, design: undefined },
        ...(tableDesign?.originalCells ?? []).map(id => ({
          id,
          design: undefined,
          integration: { ...element.integration, renderConfigs: {} },
        })),
      ];
    }
  }

  private getRendererConfigs(integration: Partial<PebIntegration>): PebContextRendererConfigs {
    if (!integration) {
      return;
    }

    const renderConfigs = { ...integration.renderConfigs };
    const type = this.rendererMap[integration.dataSource?.dataType];

    renderConfigs.image = type === PebContextRendererType.Image ? {} : undefined;
    renderConfigs.text = type === PebContextRendererType.Text ? {} : undefined;
    renderConfigs.backgroundColor = type === PebContextRendererType.BackgroundColor ? {} : undefined;

    return renderConfigs;
  }

  private getDataSourceParams(schema: PebAPIDataSourceSchema): PebDynamicParams {
    return schema?.dataType === PebIntegrationDataType.Object
      ? { contextId: 'root.urlParameters.contextId' }
      : undefined;
  }
}
