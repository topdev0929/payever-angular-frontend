import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ViewContainerRef,
  OnInit,
  createNgModule,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { EMPTY, from, Observable, ReplaySubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { AbstractFlowIdComponent } from '@pe/checkout/core';
import { ModeEnum } from '@pe/checkout/form-utils';
import { AbstractPaymentSummaryContainerInterface } from '@pe/checkout/payment';
import { FlowState } from '@pe/checkout/store';
import { PaymentMethodEnum, PaymentMethodVariantEnum } from '@pe/checkout/types';
import { PAYMENT_TRANSLATIONS } from '@pe/checkout/utils';

import { PAYMENT_SUMMARY_CONFIG_MAP } from '../../constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-rates-view-micro-container',
  templateUrl: 'payment-summary-container.component.html',
})
export class RatesViewMicroContainerComponent
  extends AbstractFlowIdComponent
  implements OnInit {

  @ViewChild('container', { read: ViewContainerRef, static: true }) containerRef: ViewContainerRef;

  PaymentMethodEnum = PaymentMethodEnum;
  payments = PAYMENT_TRANSLATIONS;

  showDefault$ = new ReplaySubject<boolean>(1);

  @SelectSnapshot(FlowState.paymentMethod)
  public paymentMethod: PaymentMethodEnum;

  initFlow(): void {
    super.initFlow();
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.flow$.pipe(
      filter(flow => !!flow.connectionId),
      switchMap(() => {
        const version = this.store.selectSnapshot(FlowState.paymentVersion);
        this.cdr.markForCheck();

        return this.loadPayment(this.paymentMethod, version).pipe(
          map(instance => this.initProps(instance)),
        );
      }),
    ).subscribe();
  }

  private loadPayment(
    paymentMethod: PaymentMethodEnum,
    variantType: PaymentMethodVariantEnum,
  ): Observable<AbstractPaymentSummaryContainerInterface> {
    if (PAYMENT_SUMMARY_CONFIG_MAP[paymentMethod]?.[variantType]) {
      return from(
        PAYMENT_SUMMARY_CONFIG_MAP[paymentMethod][variantType].import()
        .then((module) => {
          this.containerRef.clear();
          const moduleRef = createNgModule(module, this.injector);
          const componentType = moduleRef.instance.resolvePaymentSummaryStepContainerComponent();
          const { instance, hostView } = this.containerRef.createComponent(componentType, {
            injector: moduleRef.injector,
          });
          instance.mode = ModeEnum.View;
          hostView.markForCheck();

          return instance;
        })
      );
    }

    this.showDefault$.next(true);

    return EMPTY;
  }

  private initProps(
    instance: AbstractPaymentSummaryContainerInterface,
  ): AbstractPaymentSummaryContainerInterface {
    instance.mode = ModeEnum.View;

    return instance;
  }
}
