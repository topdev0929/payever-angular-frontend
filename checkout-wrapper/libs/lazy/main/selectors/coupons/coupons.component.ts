import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  createNgModule,
} from '@angular/core';

import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-coupons',
  template: '<ng-template #container></ng-template>',
  providers: [PeDestroyService],
})
export class CouponsComponent extends AbstractSelectorComponent implements OnInit {
  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/coupons-edit').then(({ CouponsEditModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(CouponsEditModule, this.injector);
      const componentType = moduleRef.instance.resolveCouponsEditContainerComponent();
      this.isAllReady$.subscribe(() => {
        this.containerRef.createComponent(componentType, {
          index: 0, 
          injector: moduleRef.injector,
        });
        this.cdr.detectChanges();
      });
    });
  }
}
