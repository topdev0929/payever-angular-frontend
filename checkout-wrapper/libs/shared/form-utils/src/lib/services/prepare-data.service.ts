import { Injectable } from '@angular/core';
import produce from 'immer';

import { isPlainObject } from '@pe/checkout/utils';
import { DateUtilService } from '@pe/checkout/utils/date';

type Merge<T, U> = {
  [K in keyof (T & U)]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
};
@Injectable()
export class PrepareDataService {

  constructor(
    protected dateUtilService: DateUtilService,
  ) {}

  prepareData<T>(formData: any): T {
    const dataStore: any = {};
    Object.keys(formData).forEach((formName: string) => {
      let datax: any = formData[formName];
      datax = this.deepMapKeys(datax, (a: any) => {
        if (a instanceof Date) {
          return this.dateUtilService.fixDate(a);
        }

        return a;
      });
      this.merge<any, any>(dataStore, datax);
    });
    const nodePaymentDetails: any = produce(dataStore, (draft: any) => {
      // All keys prefixed with '_' are not needed to be send
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

  private deepMapKeys(obj: any, fn: (d: any) => any): any {
    const x: any = {};

    Object.entries(obj || {}).forEach(([k, v]) => {
      if (isPlainObject(v)) {
        x[k] = this.deepMapKeys(v, fn);
      } else {
        x[k] = fn(v);
      }
    });

    return x;
  }

  private merge<T, U>(target: T, source: U): Merge<T, U> {
    Object.entries(source).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && target[key as keyof T]) {
        target[key as keyof T] = this.merge(target[key as keyof T], value) as any;
      } else {
        target[key as keyof T] = value;
      }
    });

    return target as Merge<T, U>;
  }
}
