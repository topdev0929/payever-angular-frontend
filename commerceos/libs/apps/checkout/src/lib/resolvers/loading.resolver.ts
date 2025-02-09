import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

@Injectable()
export class LoadingResolver implements Resolve<void> { // TODO REmove

  constructor(
    // private platformService: PlatformService
  ) {
    console.log('CHECKOUTAPP!: LoadingResolver.constructor');
  }

  resolve(): void {
    console.log('CHECKOUTAPP!: LoadingResolver.resolve');
  }

}
