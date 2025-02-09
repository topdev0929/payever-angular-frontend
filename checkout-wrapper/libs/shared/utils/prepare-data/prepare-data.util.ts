import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import produce from 'immer';

import { isPlainObject } from '../src';

dayjs.extend(utc);

export function prepareData<T>(formData: any): T {
  if (!formData){return formData}

  const dataStore: any = {};
  Object.keys(formData).forEach((formName: string) => {
    let datax: any = formData[formName];
    datax = deepMapKeys(datax, (a: any) => {
      if (a instanceof Date) {
        return fixDate(a);
      }

      return a;
    });
    merge(dataStore, datax);
  });
  const nodePaymentDetails: any = produce(dataStore, (draft: any) => {
    for (const k in draft) {
      const v = draft;
      if (k.startsWith('_')) {
        delete v[k];
      }
      else if (isPlainObject(v[k])) {
        for (const k2 in v[k]) {
          if (k2.startsWith('_')) {
            delete v[k][k2];
          }
        }
      }
    }
  });

  return nodePaymentDetails;
}

export function deepMapKeys(obj: any, fn: (d: any) => any): any {
  const x: any = {};

  Object.entries(obj || {}).forEach(([k, v]) => {
    if (isPlainObject(v)) {
      x[k] = deepMapKeys(v, fn);
    } else {
      x[k] = fn(v);
    }
  });

  return x;
}

export function fixDate(date: Date | string): string {
  if (date instanceof Date) {
    const iso: string = dayjs.utc(date).toISOString();

    return iso.split('T')[0] + 'T00:00:00.000+00:00';
  }

  return date ? date.split('T')[0] + 'T00:00:00.000+00:00' : '';
}

export function replaceUmlaut(value: string): string {
  if (typeof value !== 'string') {
    return value;
  }

  const umlautMap: {
    [key: string]: string
  } = {
    'Ä': 'AE',
    'Ö': 'OE',
    'Ü': 'UE',
    'ẞ': 'SS',
    'ä': 'ae',
    'ö': 'oe',
    'ü': 'ue',
    'ß': 'ss',
  };

  return value
  .replace(/[ÄÖÜẞ][a-z]/g, (a) => {
    const big = umlautMap[a.slice(0, 1)];

    return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
  })
  .replace(new RegExp(`[${Object.keys(umlautMap).join('')}]`, 'g'),
    a => umlautMap[a]
  );
}

type Merge<T, U> = {
  [K in keyof (T & U)]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
};
function merge<T, U>(target: T, source: U): Merge<T, U> {
  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && target[key as keyof T]) {
      target[key as keyof T] = merge(target[key as keyof T], value) as any;
    } else {
      target[key as keyof T] = value;
    }
  });

  return target as Merge<T, U>;
}
