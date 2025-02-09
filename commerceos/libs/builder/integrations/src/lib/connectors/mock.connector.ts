import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

import {
  PebAPIDataSourceSchema,
  PebConnectorContext,
  PebDataSourceTypes,
  PebIntegrationAction,
  PebIntegrationDataModels,
  PebIntegrationDataType,
} from '@pe/builder/core';

import { PebIntegrationConnector } from '../interfaces/connector.interface';

const TABLE_TAG = 'sample-table';
const OBJ_TAG = 'sample-detail';
const ERROR_TAG = 'error-simulate';
const LAZY_TAG = 'lazy-simulate';
const ARRAY_TAG = 'sample-array';
const COLOR_ARRAY_TAG = 'sample-color-array';
const COLOR_OBJ_TAG = 'sample-color-object';


@Injectable()
export class PebMockConnector implements PebIntegrationConnector {
  id = 'mock-connector';
  title = 'Mock Connector';
  context$: Observable<PebConnectorContext> = EMPTY

  dataSources: PebAPIDataSourceSchema[] = [
    {
      id: '1',
      connectorId: this.id,
      title: 'Sample table',
      type: PebDataSourceTypes.API,
      dataType: PebIntegrationDataType.Table,
      defaultParams: '',
      fields: [
        {
          dataType: PebIntegrationDataType.UUID,
          name: 'id',
          title: 'ID',
        },
        {
          dataType: PebIntegrationDataType.String,
          name: 'title',
          title: 'Title',
        },
        {
          dataType: PebIntegrationDataType.ImageUrl,
          name: 'imageUrl',
          title: 'Cover Image',
        },
      ],
      inputs: [],
      uniqueTag: TABLE_TAG,
    },
    {
      id: '2',
      connectorId: this.id,
      title: 'Sample object',
      type: PebDataSourceTypes.API,
      dataType: PebIntegrationDataType.Object,
      defaultParams: '',
      fields: [
        {
          dataType: PebIntegrationDataType.UUID,
          name: 'id',
          title: 'ID',
        },
        {
          dataType: PebIntegrationDataType.String,
          name: 'title',
          title: 'Title',
        },
        {
          dataType: PebIntegrationDataType.ImageUrl,
          name: 'imageUrl',
          title: 'Cover Image',
        },
        {
          dataType: PebIntegrationDataType.Number,
          name: 'count',
          title: 'count',
        },
        {
          dataType: PebIntegrationDataType.Array,
          name: 'options',
          title: 'Options',
          fields: [
            {
              dataType: PebIntegrationDataType.UUID,
              name: 'id',
              title: 'ID',
            },
            {
              dataType: PebIntegrationDataType.String,
              name: 'title',
              title: 'Title',
            },
            {
              dataType: PebIntegrationDataType.ImageUrl,
              name: 'imageUrl',
              title: 'Image',
            },
          ],
        },
        {
          dataType: PebIntegrationDataType.Object,
          name: 'selected',
          title: 'Selected Item',
          fields: [
            {
              dataType: PebIntegrationDataType.UUID,
              name: 'id',
              title: 'ID',
            },
            {
              dataType: PebIntegrationDataType.String,
              name: 'title',
              title: 'Title',
            },
            {
              dataType: PebIntegrationDataType.ImageUrl,
              name: 'imageUrl',
              title: 'Image',
            },
          ],
        },
        {
          dataType: PebIntegrationDataType.Object,
          name: 'nested',
          title: 'Nested',
          fields: [
            {
              dataType: PebIntegrationDataType.String,
              name: 'name',
              title: 'Name',
            },
          ],
        },
      ],
      inputs: [],
      uniqueTag: OBJ_TAG,
    },
    {
      id: '3',
      connectorId: this.id,
      title: 'Error Simulate',
      type: PebDataSourceTypes.API,
      dataType: PebIntegrationDataType.Object,
      defaultParams: '',
      fields: [],
      inputs: [],
      uniqueTag: ERROR_TAG,
    },
    {
      id: '4',
      connectorId: this.id,
      title: 'Lazy Simulate (500ms)',
      type: PebDataSourceTypes.API,
      dataType: PebIntegrationDataType.Object,
      defaultParams: '',
      fields: [],
      inputs: [],
      uniqueTag: LAZY_TAG,
    },
    {
      id: ARRAY_TAG,
      connectorId: this.id,
      title: 'Sample Array',
      type: PebDataSourceTypes.API,
      dataType: PebIntegrationDataType.Array,
      defaultParams: '',
      fields: [
        {
          dataType: PebIntegrationDataType.UUID,
          name: 'id',
          title: 'ID',
        },
        {
          dataType: PebIntegrationDataType.String,
          name: 'title',
          title: 'Title',
        },
        {
          dataType: PebIntegrationDataType.ImageUrl,
          name: 'imageUrl',
          title: 'Image',
        },
      ],
      inputs: [],
      uniqueTag: ARRAY_TAG,
    },
    {
      id: COLOR_ARRAY_TAG,
      connectorId: this.id,
      title: 'Sample Color Array',
      type: PebDataSourceTypes.API,
      dataType: PebIntegrationDataType.Array,
      defaultParams: '',
      fields: [
        {
          dataType: PebIntegrationDataType.String,
          name: 'name',
          title: 'Name',
        },
        {
          dataType: PebIntegrationDataType.Color,
          name: 'hex',
          title: 'Color',
        },
      ],
      inputs: [],
      uniqueTag: COLOR_ARRAY_TAG,
    },
    {
      id: COLOR_OBJ_TAG,
      connectorId: this.id,
      title: 'Sample Color Object',
      type: PebDataSourceTypes.API,
      dataType: PebIntegrationDataType.Object,
      defaultParams: '',
      fields: [
        {
          dataType: PebIntegrationDataType.String,
          name: 'name',
          title: 'Name',
        },
        {
          dataType: PebIntegrationDataType.Color,
          name: 'hex',
          title: 'Color',
        },
      ],
      inputs: [],
      uniqueTag: COLOR_OBJ_TAG,
    },
  ];

  actions: (PebIntegrationAction)[] = [
    {
      id: '1',
      uniqueTag: '1',
      connectorId: this.id,
      title: 'Nothing',
      method: '',
    },
    {
      id: '2',
      uniqueTag: '2',
      connectorId: this.id,
      title: 'Log contextId',
      method: 'mock.log',
      dynamicParams: { contextId: 'context.value.id' },
    },
    {
      id: 'console-log-context',
      uniqueTag: 'console-log-context',
      connectorId: this.id,
      title: 'Log context',
      method: 'mock.log',
      dynamicParams: { context: 'context' },
    },
    {
      id: 'alert-time',
      uniqueTag: 'alert-time',
      connectorId: this.id,
      title: 'Alert Time',
      method: 'mock.alert',
      dynamicParams: { time: 'time' },
    },
    {
      id: 'simulate-error',
      uniqueTag: 'simulate-error',
      connectorId: this.id,
      title: 'Simulate Error',
      method: 'mock.error',
      dynamicParams: { error: 'sample error data' },
    },
    {
      id: 'simulate-observable',
      uniqueTag: 'simulate-observable',
      connectorId: this.id,
      title: 'Simulate Observable',
      method: 'mock.observable',
    },
    {
      id: 'sample-update-context',
      uniqueTag: 'mock.sample-update-context',
      title: 'Select Option',
      connectorId: this.id,
      method: 'context.patch',
      dynamicParams: {
        uniqueTag: { _: OBJ_TAG },
        patch: {
          selected: 'value',
          touched: { _: true },
        },
      },
    },
  ];

  imageUrls = [
    'https://wp-payever.azureedge.net/images/pos/ng/big_images/qrmob.png',
    'https://cdn.payever.org/site-images/f3274b36-519d-47cb-8510-16a0561a925c',
    'https://cdn.payever.org/site-images/fa32171c-e666-436d-91f1-dc55c07fc0e3',
    'https://payever-ci-connected-commerce.vercel.app/assets/details-checkout.png',
    'https://cdn.payever.org/site-images/42448157-7e33-42f8-bbaa-0f57af87c3e2',
  ];

  sampleSelectOptions: PebIntegrationDataModels.Array = [
    { id: '1', title: 'Select 1', imageUrl: this.imageUrls[0] },
    { id: '2', title: 'Select 2', imageUrl: this.imageUrls[1] },
    { id: '3', title: 'Select 3', imageUrl: this.imageUrls[2] },
    { id: '4', title: 'Select 4', imageUrl: this.imageUrls[3] },
    { id: '5', title: 'Select 5', imageUrl: this.imageUrls[4] },
  ];

  sampleColor = [
    {
      name: 'Yellow',
      hex: '#ffff00',
    },
    {
      name: 'Blue',
      hex: '#48A0F8',
    },
    {
      name: 'Custom',
      hex: '#3b0d5f',
    },
  ];

  sampleData = [
    {
      id: '1', title: 'Title 1', imageUrl: this.imageUrls[0], count: 10, nested: { name: 'nested name 10' },
      selected: this.sampleSelectOptions[4],
      options: [
        { id: '1', title: 'Option A', imageUrl: this.imageUrls[0] },
        { id: '2', title: 'Option B', imageUrl: this.imageUrls[1] },
      ],
    },
    { id: '2', title: 'Title 2', imageUrl: this.imageUrls[1], count: 20, nested: { name: 'nested name 20' }, options: [] },
    { id: '3', title: 'Title 3', imageUrl: this.imageUrls[2], count: 30, nested: { name: 'nested name 30' }, options: [] },
    { id: '4', title: 'Title 4', imageUrl: this.imageUrls[3], count: 40, nested: { name: 'nested name 40' }, options: [] },
  ];

  getDataSources(): Observable<PebAPIDataSourceSchema[]> {
    return of(this.dataSources);
  }

  init(): Observable<boolean> {
    return of(true);
  }

  setContext(context$: Observable<PebConnectorContext>): void {
    this.context$ = context$;
  }

  getDataSourceById(id: string): Observable<PebAPIDataSourceSchema | undefined> {
    return of(this.dataSources.find(source => source.id === id));
  }

  getData(dataSourceId: string, params: any): Observable<any> {
    return this.getDataSourceById(dataSourceId).pipe(
      switchMap((dataSource) => {
        switch (dataSource?.uniqueTag) {
          case TABLE_TAG: return of({ value: this.sampleData, dataType: 'table', total: this.sampleData.length, skip: 0, take: 10 });
          case OBJ_TAG: return of(this.sampleData.find(item => item.id === (params?.id ?? '1')));
          case ERROR_TAG: throw new Error('MockDataSource Error!');
          case LAZY_TAG: return of({}).pipe(delay(500));
          case ARRAY_TAG: return of(this.sampleSelectOptions);
          case COLOR_ARRAY_TAG: return of(this.sampleColor);
          case COLOR_OBJ_TAG: return of(this.sampleColor[0]);
          default: return of(undefined);
        }
      }),
    );
  }

  getDataCacheKey(dataSourceId: string, params: any): string | undefined {
    return undefined;
  }

  getActions(): Observable<PebIntegrationAction[]> {
    return of(this.actions);
  }

  getActionById(id: string): Observable<PebIntegrationAction | undefined> {
    return of(this.actions.find(action => action.id === id));
  }
}
