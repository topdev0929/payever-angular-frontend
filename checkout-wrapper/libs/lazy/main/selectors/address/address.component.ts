import {
  Component,
  ChangeDetectionStrategy,
  createNgModule,
} from '@angular/core';

import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-address',
  template: '<ng-template #container></ng-template>',
  providers: [PeDestroyService],
})
export class AddressComponent extends AbstractSelectorComponent {

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/address-edit').then(({ AddressEditModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(AddressEditModule, this.injector);
      const componentType = moduleRef.instance.resolveAddressWrapperComponent();
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
