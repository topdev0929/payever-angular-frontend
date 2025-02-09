import {
  Component,
  ChangeDetectionStrategy,
  createNgModule,
} from '@angular/core';

import { AbstractLazyLoadingComponent } from '@pe/checkout/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-send-to-device',
  template: '<ng-template #container></ng-template>',
})
export class MainSendToDeviceComponent extends AbstractLazyLoadingComponent {

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/send-flow').then(({ SendFlowModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(SendFlowModule, this.injector);
      const componentType = moduleRef.instance.resolveSendToDeviceComponent();
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
