import {
  Component,
  ChangeDetectionStrategy,
  createNgModule,
} from '@angular/core';

import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-edit-payment-method',
  templateUrl: 'payment-edit.component.html',
  providers: [PeDestroyService],
})
export class MainPaymentEditComponent extends AbstractSelectorComponent {

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/payments-edit').then(({ PaymentsEditModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(PaymentsEditModule, this.injector);
      const componentType = moduleRef.instance.resolvePaymentEditComponent();
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
