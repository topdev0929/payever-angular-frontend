import { HostBinding, Directive, Injector } from '@angular/core';

import { BaseTimestampEvent } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Directive()
export abstract class BaseCustomElementWrapperComponent {

  @HostBinding('class.pe-checkout-bootstrap') peBootstrapClass = true;

  protected destroy$ = this.injector.get(PeDestroyService);

  constructor(protected injector: Injector) {}

  parseInputObject(data: string): any {
    let result: any = data;
    try {
      result = JSON.parse(data);
    } catch (e) {}

    return result;
  }

  parseInputBoolean(data: any): boolean {
    return data === true || data === 'true';
  }

  parseInputNumber(data: any): number {
    return parseFloat(data);
  }

  parseInputString(data: string): string {
    let result: string = data;
    try {
      result = JSON.parse(data);
    } catch (e) {}

    return String(result);
  }

  parseInputByType<T>(data: any): T {
    let result: T = data;
    try {
      result = JSON.parse(String(data));
    } catch (e) {}

    return result;
  }

  parseInputEventEmit<T>(data: string): T {
    const result: T = this.parseInputObject(data);
    if (result) {
      delete (result as any as BaseTimestampEvent)._timestamp;
    }

    return result;
  }

  checkInputEventEmit(data: any): boolean {
    const event: BaseTimestampEvent = this.parseInputObject(data);

    return event && !!event._timestamp;
  }
}
