import { Component, Inject, Renderer2 } from '@angular/core';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { RootCheckoutWrapperService } from '../../services';
import { AbstractComponent } from '../../components';

@Component({
  selector: 'root-checkout-wrapper',
  templateUrl: './root-checkout-wrapper.component.html',
  styleUrls: ['./root-checkout-wrapper.component.scss']
})
export class RootCheckoutWrapperComponent extends AbstractComponent {

  dialogStyle: any = null;

  isReady$ = this.wrapperService.isCustomElementReady$;
  isVisible$ = this.wrapperService.checkoutVisible$;

  microCheckoutVersionVar = 'MICRO_CHECKOUT_XXXXX';
  version: string = 'MICRO_CHECKOUT_VERSION' === this.microCheckoutVersionVar.replace('XXXXX', 'VERSION') ?
    'latest' : 'MICRO_CHECKOUT_VERSION';

  constructor(
    public wrapperService: RootCheckoutWrapperService,
    @Inject(PE_ENV) private env: EnvInterface,
    private renderer: Renderer2
  ) {
    super();
  }

  get bootstrapScriptUrl(): string {
    return `${this.env.frontend.checkoutWrapper}/wrapper/${this.version}/checkout-main-ce/micro.js`;
  }
}
