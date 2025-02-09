import { ChangeDetectionStrategy, Component, HostBinding, ViewContainerRef, ViewEncapsulation } from '@angular/core';

import { BUILDER_CORE_VERSION } from '@pe/builder/core';
import { AppType } from '@pe/common';

import { PebClientCheckoutLoaderService } from './services';

export type PebFaviconType = { [type in AppType]?: string };

@Component({
  selector: 'peb-client',
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      display: block;
    }
    div[peb-type=document]{display:block}
    svg{width:0;height:0}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PebClientAppComponent {
  @HostBinding('attr.peb-core-version') get version(): string {
    return BUILDER_CORE_VERSION;
  }

  constructor(
    private readonly checkoutLoader: PebClientCheckoutLoaderService,
    private readonly vcr: ViewContainerRef,

  ){
    this.loadCheckout();
  }

  private loadCheckout(): void {
    this.checkoutLoader.load(this.vcr);
  }
}
