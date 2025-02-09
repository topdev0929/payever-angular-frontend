import { from, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { random } from 'lodash';

export function ImitateHttp() {
  let originalFunc: Function;

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    originalFunc = descriptor.value;

    descriptor.value = function (...args: any[]): Observable<any> {

      return from(originalFunc.apply(this, args)).pipe(
        delay(random(300, 500)),
      );

    };
  };
}
