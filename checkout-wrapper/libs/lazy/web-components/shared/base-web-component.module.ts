import { Directive, Injector } from '@angular/core';

@Directive()
export abstract class BaseWebComponentModule<T = any> {
  abstract resolveComponent(): T;
  constructor(
    protected injector: Injector,
  ) {
  }
}
