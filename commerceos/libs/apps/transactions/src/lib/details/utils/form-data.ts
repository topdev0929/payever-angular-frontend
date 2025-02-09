import { forIn } from 'lodash';

import { ActionRequestInterface, ActionRequestRefundItemsInterface } from '../../shared';

export function makeFormData(data: { [propName: string]: ActionRequestInterface }): string {
  let serializedData = '';
  forIn(data, (dataValue: ActionRequestInterface, dataKey: string) => {
    forIn(dataValue, (value: number | string | boolean | ActionRequestRefundItemsInterface[], key: string) => {
      const formKey: string = encodeURIComponent(`${dataKey}[${key}]`);
      if (typeof value === 'string' || typeof value === 'number') {
        serializedData += `&${formKey}=${encodeURIComponent(value as string)}`;
      }
      else if (typeof value === 'boolean') {
        serializedData += `&${formKey}=${value ? '1' : '0'}`;
      }
    });
  });

  return serializedData.replace(/^&/, '');
}
