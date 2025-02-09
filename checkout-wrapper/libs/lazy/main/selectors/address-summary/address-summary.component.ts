import {
  Component,
  ChangeDetectionStrategy,
  createNgModule,
} from '@angular/core';

import { AbstractLazyLoadingComponent } from '@pe/checkout/core';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-address-summary',
  templateUrl: 'address-summary.component.html',
  providers: [PeDestroyService],
})
export class MainAddressSummaryComponent extends AbstractLazyLoadingComponent {

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/address-view').then(({ AddressViewModule }) => {
      const moduleRef = createNgModule(AddressViewModule, this.injector);
      const componentType = moduleRef.instance.resolveAddressSummaryComponent();
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
