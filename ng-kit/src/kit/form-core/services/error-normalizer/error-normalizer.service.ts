import { forEach, isArray, values } from 'lodash-es';

import { ErrorBagFlatData } from '../error-bag/error-bag';
import { Injectable } from "@angular/core";

export interface NodeJsErrorInterface {
  target: any; // Data that was send to server (raw)
  value: any; // Value that have not passed validation
  property: string; // Error field. Example: 'streetNumber'
  constraints: {[key: string]: string}; // List of errors for 'property'. Example: {'isNotEmpty': 'streetNumber should not be empty'}
  children: NodeJsErrorInterface[];
}

@Injectable()
export class ErrorNormalizerService {

  nodejsToFlat(errors: NodeJsErrorInterface): ErrorBagFlatData {
    const result: ErrorBagFlatData = {};
    if (errors && isArray(errors)) {
      forEach(errors, err => {
        if (err && err.property) {
          if (err.constraints) {
            result[err.property] = values(err.constraints).join(', ');
          }
          else if (err.children && isArray(err.children)) {
            forEach(this.nodejsToFlat(err.children), (childValue: string, childKey: string) => {
              result[`${err.property}.${childKey}`] = childValue;
            });
          }
        }
      });
    }
    return result;
  }

  nodejsAsLine(errors: NodeJsErrorInterface, defaultError: string = null): string {
    const flat: ErrorBagFlatData = this.nodejsToFlat(errors);
    return values(flat).length > 0 ? values(flat).join(', ') : defaultError;
  }
}
