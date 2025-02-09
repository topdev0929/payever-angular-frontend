import {
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  createNgModule,
} from '@angular/core';

import { AbstractLazyLoadingComponent } from '@pe/checkout/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-shipping-summary',
  styleUrls: ['./shipping-summary.component.scss'],
  templateUrl: 'shipping-summary.component.html',
})
export class ShippingSummaryComponent extends AbstractLazyLoadingComponent {

  @HostBinding('class.pe-checkout-bootstrap') hostClass = true;

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/shipping-view').then(({ ShippingViewModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(ShippingViewModule, this.injector);
      const componentType = moduleRef.instance.resolveShippingViewContainerComponent();
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
