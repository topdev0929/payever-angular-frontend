import {
  Component,
  ChangeDetectionStrategy,
  createNgModule,
} from '@angular/core';
import { combineLatest, EMPTY, from, merge, Observable } from 'rxjs';
import { catchError, map, mapTo, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { FinishFlowService } from '@pe/checkout/core';
import {
  AbstractPaymentDetailsContainerInterface,
  PaymentVariantService,
} from '@pe/checkout/payment';
import { FlowState, OpenNextStep, OpenStep } from '@pe/checkout/store';
import {
  PaymentMethodEnum,
  PaymentMethodVariantEnum,
  SectionType,
} from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../abstract';

import { PAYMENT_DETAILS_CONFIG_MAP } from './constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-payment',
  templateUrl: 'payment.component.html',
  providers: [PeDestroyService],
})
export class MainPaymentComponent extends AbstractSelectorComponent {

  private paymentVariantService = this.injector.get(PaymentVariantService);
  private paymentHelperService = this.injector.get(PaymentHelperService);
  private finishFlowService = this.injector.get(FinishFlowService);

  protected loadLazyModuleAndComponent(): void {
    this.flow$.pipe(
      take(1),
      switchMap(() => {
        const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
        const version = this.store.selectSnapshot(FlowState.paymentVersion);

        return this.loadPaymentModule(paymentMethod, version).pipe(
          catchError(err => this.paymentVariantService.handleError(err, this.containerRef).pipe(
            map(() => null),
            tap(() => {
              this.loadLazyModuleAndComponent();
            }),
          )),
          switchMap(instance => this.initComponentProps(instance)),
        );
      }),
    ).subscribe();
  }

  private initComponentProps(
    instance: AbstractPaymentDetailsContainerInterface,
  ): Observable<AbstractPaymentDetailsContainerInterface> {
    return this.flow$.pipe(
      switchMap(() => this.isAllReady$.pipe(
        switchMap(() => this.initBaseProps(instance).pipe(
          tap(() => {
            instance.cdr?.markForCheck();
            this.cdr.markForCheck();
          }),
        )),
      ))
    );
  }

  private initBaseProps(
    instance: AbstractPaymentDetailsContainerInterface,
  ): Observable<AbstractPaymentDetailsContainerInterface> {
    const isForceNoCloseButton$ = this.pickParam$(this.destroy$, d => d.forceNoCloseButton);
    const showCloseButton$ = combineLatest([isForceNoCloseButton$, this.flow$]).pipe(
      takeUntil(this.destroy$),
      map(([isForceNoCloseButton, flow]) => !isForceNoCloseButton && this.paymentHelperService.isPos(flow))
    );

    return merge(
      showCloseButton$?.pipe(
        tap(value => instance.showCloseButton = value),
      ) || [],
      instance.closeButtonClicked?.pipe(
        tap(() => this.onCloseButtonClicked()),
      ) || [],
      instance.continue.pipe(
        tap(() => {
          this.store.dispatch(new OpenNextStep());
        }),
      ),
    ).pipe(
      mapTo(instance),
      takeUntil(this.destroy$),
    );
  }

  private loadPaymentModule(
    paymentMethod: PaymentMethodEnum,
    variantType: PaymentMethodVariantEnum,
  ): Observable<AbstractPaymentDetailsContainerInterface> {
    const variant = variantType ?? PaymentMethodVariantEnum.Default;

    if (!paymentMethod) {
      this.store.dispatch(new OpenStep(SectionType.ChoosePayment));

      return EMPTY;
    }

    return from(
      PAYMENT_DETAILS_CONFIG_MAP[paymentMethod][variant].import()
        .then((module) => {
          const factory = createNgModule(module, this.injector);
          const componentType = factory.instance.resolvePaymentDetailsStepContainerComponent();
          const componentRef = this.containerRef.createComponent(componentType, {
            index: 0,
            injector: factory.injector,
          });
          const { instance } = componentRef;

          return instance;
        })
    );
  }

  private onCloseButtonClicked(): void {
    this.finishFlowService.closeCheckout(this.flow, true);
  }
}
