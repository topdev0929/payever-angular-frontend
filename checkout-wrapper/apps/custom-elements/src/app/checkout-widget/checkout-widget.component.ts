import {
  ChangeDetectionStrategy,
  Component,
  createNgModule,
  ViewContainerRef,
} from '@angular/core';
import { from } from 'rxjs';

import { PeDestroyService } from '@pe/destroy';

import { BaseCheckoutWidgetComponent } from '../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'pe-checkout-widget',
  template: '<ng-template #container></ng-template>',
  providers: [
    PeDestroyService,
  ],
})
export class PeCheckoutWidgetComponent extends BaseCheckoutWidgetComponent {

  protected loadComponent(containerRef: ViewContainerRef) {
    return from(
      import('@pe/checkout/web-components/widget')
      .then(m => m.CeWidgetModule)
      .then((module) => {
        const moduleRef = createNgModule(module, this.injector);
        const componentType = moduleRef.instance.resolveComponent();
        const component = containerRef.createComponent<any>(componentType, {
          index: 0,
          injector: moduleRef.injector,
        });

        return component;
      }),
    );
  }
}
