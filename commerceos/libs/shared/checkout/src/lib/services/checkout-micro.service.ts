import { Inject, Injectable, isDevMode } from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { initRemote, loadRemoteModule } from '@pe/micro';

import { CheckoutSharedService } from './checkout-shared.service';

@Injectable()
export class CheckoutMicroService {

  private readonly remoteName = 'checkoutWrapperCe';
  private readonly microCheckoutVersionVar = 'MICRO_CHECKOUT_XXXXX';
  private readonly version = 'MICRO_CHECKOUT_VERSION' === this.microCheckoutVersionVar.replace('XXXXX', 'VERSION')
    ? 'latest'
    : 'MICRO_CHECKOUT_VERSION';

  public readonly remote$ = this.checkoutSharedService.locale$.pipe(
    switchMap(locale => from(initRemote(
      this.remoteName,
      isDevMode()
        ? 'http://localhost:4200/remoteEntry.js'
        : `${this.env.frontend.checkoutWrapper}/wrapper/${locale}/${this.version}/checkout-main-ce/remoteEntry.js`
    )).pipe(
      switchMap(() => forkJoin(
        ['skeleton', 'customElements'].map(
          module => loadRemoteModule(this.remoteName, module),
        )
      )),
    ))
  );

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private checkoutSharedService: CheckoutSharedService,
  ) {}

  getRemote(channelSetId: string) {
    return this.checkoutSharedService.getLocale(channelSetId).pipe(
      switchMap(locale => from(initRemote(
        this.remoteName,
        isDevMode()
          ? 'http://localhost:4200/remoteEntry.js'
          : `${this.env.frontend.checkoutWrapper}/wrapper/${locale}/${this.version}/checkout-main-ce/remoteEntry.js`
      )).pipe(
        switchMap(() => forkJoin(
          ['skeleton', 'customElements'].map(
            module => loadRemoteModule(this.remoteName, module),
          )
        )),
      )),
    );
  }
}
