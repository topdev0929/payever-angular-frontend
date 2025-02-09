import {
  Component,
  ChangeDetectionStrategy,
  Input,
  createNgModule,
} from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../../../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-products-edit',
  template: '<ng-template #container></ng-template>',
  styleUrls: ['./products-edit.component.scss'],
  providers: [PeDestroyService],
})
export class ProductsEditComponent extends AbstractSelectorComponent {

  @Input() submitText = $localize`:@@amount.action.continue:`;

  @Input() paymentMethod: PaymentMethodEnum;

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/products-edit').then(({ ProductsEditModule }) => {
      const moduleRef = createNgModule(ProductsEditModule, this.injector);
      const componentType = moduleRef.instance.resolveProductsEditContainerComponent();
      this.isAllReady$.pipe(
        tap(() => {
          const componentRef = this.containerRef.createComponent(componentType, {
          index: 0, 
          injector: moduleRef.injector,
        });
          const { instance } = componentRef;
          instance.submitText = this.submitText;
          instance.paymentMethod = this.paymentMethod;
          componentRef.hostView.markForCheck();
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    });
  }
}
