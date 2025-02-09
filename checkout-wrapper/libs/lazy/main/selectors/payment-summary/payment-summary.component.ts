import {
  ChangeDetectionStrategy,
  Component,
  createNgModule,
} from '@angular/core';

import { AbstractLazyLoadingComponent } from '@pe/checkout/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-payment-summary',
  templateUrl: 'payment-summary.component.html',
})
export class PaymentSummaryComponent extends AbstractLazyLoadingComponent {

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/payments-summary').then(({ PaymentsSummaryModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(PaymentsSummaryModule, this.injector);
      const componentType = moduleRef.instance.resolvePaymentSummaryComponent();
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
