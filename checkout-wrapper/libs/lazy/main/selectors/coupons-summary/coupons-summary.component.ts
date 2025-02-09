import {
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  createNgModule,
} from '@angular/core';

import { AbstractLazyLoadingComponent } from '@pe/checkout/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-coupons-summary',
  styleUrls: ['./coupons-summary.component.scss'],
  templateUrl: 'coupons-summary.component.html',
})
export class CouponsSummaryComponent extends AbstractLazyLoadingComponent {

  @HostBinding('class.pe-checkout-bootstrap') hostClass = true;

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/coupons-view').then(({ CouponsViewModule }) => {
        // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(CouponsViewModule, this.injector);
      const componentType = moduleRef.instance.resolveCouponsViewContainerComponent();
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
