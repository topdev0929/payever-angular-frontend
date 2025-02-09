import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  createNgModule,
} from '@angular/core';
import { from, merge, Observable } from 'rxjs';
import { mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AbstractWithFlowCloneComponent } from '@pe/checkout/core';
import { AbstractPaymentEditContainerInterface } from '@pe/checkout/payment';
import { FlowState, OpenNextStep, SetPaymentComplete } from '@pe/checkout/store';
import { PaymentMethodEnum, PaymentMethodVariantEnum } from '@pe/checkout/types';

import { PAYMENT_EDIT_CONFIG_MAP } from '../../constants';

@Component({
  selector: 'section-payment-edit',
  template: `
  <div class="pe-payment-micro">
    <ng-template #container></ng-template>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentEditComponent
  extends AbstractWithFlowCloneComponent
  implements OnInit {

  @ViewChild('container', { read: ViewContainerRef, static: true }) containerRef: ViewContainerRef;

  error: string = null;
  merchantMode$: Observable<boolean>;
  embeddedMode$: Observable<boolean>;

  readonly PaymentMethodEnum = PaymentMethodEnum;

  ngOnInit(): void {
    super.ngOnInit();

    this.flow$.pipe(
      switchMap((flow) => {
        const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
        const version = this.store.selectSnapshot(FlowState.paymentVersion);

        return this.loadPayment(paymentMethod, version).pipe(
          switchMap(instance => this.initProps(instance)),
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  initFlow(): void {
    super.initFlow();
    this.merchantMode$ = this.pickParam$(this.destroy$, d => d.merchantMode);
    this.embeddedMode$ = this.pickParam$(this.destroy$, d => d.embeddedMode);
    this.loadPaymentData();
  }

  onFinishModalShownEx(isFinishModalShown: boolean): void {
    this.store.dispatch(new SetPaymentComplete(isFinishModalShown));
  }


  private loadPayment(
    paymentMethod: PaymentMethodEnum,
    variantType: PaymentMethodVariantEnum,
  ): Observable<AbstractPaymentEditContainerInterface> {
    return from(
      PAYMENT_EDIT_CONFIG_MAP[paymentMethod][variantType].import()
      .then((module) => {
        const moduleRef = createNgModule(module, this.injector);
        const componentType = moduleRef.instance.resolveEditContainerComponent();
        const { instance } = this.containerRef.createComponent(componentType, {
          index: 0, 
          injector: moduleRef.injector,
        });
        instance.cdr.markForCheck();

        return instance;
      })
    );
  }

  private initProps(
    instance: AbstractPaymentEditContainerInterface,
  ): Observable<AbstractPaymentEditContainerInterface> {
    return merge(
      instance.finishModalShown.pipe(
        tap((e: any) => this.onFinishModalShownEx(e)),
        takeUntil(this.destroy$),
      ),
      instance.continue.pipe(
        tap(() => {
          this.store.dispatch(new OpenNextStep());
        }),
        takeUntil(this.destroy$),
      ),
    ).pipe(
      tap(() => {
        instance.cdr.markForCheck();
      }),
      mapTo(instance),
    );
  }
}
