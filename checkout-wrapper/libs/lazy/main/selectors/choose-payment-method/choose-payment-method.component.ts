import {
  ChangeDetectionStrategy,
  Component,
  createNgModule,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import type { ChoosePaymentComponent } from '@pe/checkout/sections/payments-choose';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-choose-payment-method',
  templateUrl: 'choose-payment-method.component.html',
  providers: [PeDestroyService],
})
export class MainChoosePaymentMethodComponent extends AbstractSelectorComponent {

  minHeight = 0;

  private instance: ChoosePaymentComponent;
  private subs: Subscription[] = [];

  private loaderService: LoaderService = this.injector.get(LoaderService);

  protected initFlow(): void {
    super.initFlow();
    this.initInputsOutputs();
    this.flow$.pipe(filter(d => !!d), take(1)).subscribe((flow) => {
      if (flow.paymentOptions?.length === 1
        && flow.paymentOptions[0].paymentMethod === PaymentMethodEnum.SANTANDER_INVOICE_DE
      ) {
        // TODO: Investigate
        // Just small improvement for UI to have
        // beautiful fade out from skeleton when we open link like /pay/api-call/{id}
        this.minHeight = 301;
        this.cdr.detectChanges();
      }
    });
  }

  protected initInputsOutputs(): void {
    if (this.instance) {
      this.subs?.forEach(s => s?.unsubscribe());
      this.subs = [
        // TODO: Centralize globalLoading via store or service - no output emissions
        this.instance.globalLoading.pipe(
          tap(value => this.loaderService.loaderGlobal = value),
          takeUntil(this.destroy$),
        ).subscribe(),
      ];
    }
  }

  protected loadLazyModuleAndComponent(): void {
    import('@pe/checkout/sections/payments-choose').then(({ PaymentsChooseModule }) => {
      const moduleRef = createNgModule(PaymentsChooseModule, this.injector);
      const componentType = moduleRef.instance.resolveChoosePaymentMethodComponent();
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
