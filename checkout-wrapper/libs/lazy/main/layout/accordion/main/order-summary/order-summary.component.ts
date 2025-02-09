import {
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  createNgModule,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AbstractLazyLoadingComponent } from '@pe/checkout/core';
import { OrderSummaryContainerComponent } from '@pe/checkout/sections/order-summary';
import { PaymentHelperService } from '@pe/checkout/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-order-summary',
  template: '<ng-template #container></ng-template>',
})
export class OrderSummaryComponent extends AbstractLazyLoadingComponent {

  @HostBinding('class.pe-checkout-bootstrap') hostClass = true;

  protected i18nDomains: string[] = ['checkout-section-order'];

  private instance: OrderSummaryContainerComponent = null;
  private subs: Subscription[] = [];

  private paymentHelperService: PaymentHelperService = this.injector.get(PaymentHelperService);


  protected initFlow(): void {
    super.initFlow();
    this.initInputsOutputs();
  }

  protected initInputsOutputs(): void {
    if (this.instance) {
      this.subs?.forEach(s => s?.unsubscribe());
      this.subs = [
        this.paymentHelperService.totalAmount$.pipe(takeUntil(this.destroy$)).subscribe((totalAmount: number) => {
          this.instance.setTotal = totalAmount;
        }),
        this.paymentHelperService.downPayment$.pipe(takeUntil(this.destroy$)).subscribe((downPayment: number) => {
          this.instance.setDownPayment = downPayment;
        }),
      ];
    }
  }

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/order-summary').then(({ OrderSummaryModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(OrderSummaryModule, this.injector);
      const componentType = moduleRef.instance.resolveOrderSummaryContainerComponent();
      this.isAllReady$.subscribe(() => {
        const instanceData = this.containerRef.createComponent(componentType, {
          index: 0,
          injector: moduleRef.injector,
        });

        this.instance = instanceData.instance;
        this.initInputsOutputs();

        this.cdr.detectChanges();
      });
    });
  }
}
