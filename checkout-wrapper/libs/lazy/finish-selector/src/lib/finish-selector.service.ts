import { Injectable, Injector, ViewContainerRef, createNgModule } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { EMPTY, from, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { BasePaymentFinishModule, BasePaymentModule } from '@pe/checkout/payment';
import { FlowState, ParamsState } from '@pe/checkout/store';
import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { FINISH_SELECTOR_CONFIG } from './finish-selector.config';


@Injectable()
export class FinishSelectorService {

  constructor(
    private store: Store,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
  ) {}

  lazyLoadModule(
    injector: Injector,
    containerRef: ViewContainerRef,
  ): Observable<void> {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentOption)?.paymentMethod;

    if (!paymentMethod) {
      this.router.navigate(['/pay', 'static-finish', 'fail']);

      return EMPTY;
    }

    const version = this.store.selectSnapshot(FlowState.paymentVersion);
    const variantType: PaymentMethodVariantEnum = version ?? PaymentMethodVariantEnum.Default;
    const { editMode } = this.store.selectSnapshot(ParamsState.params);

    return from(FINISH_SELECTOR_CONFIG[paymentMethod][variantType].import(!!editMode)
      .then((module) => {
        const moduleRef = createNgModule<BasePaymentModule | BasePaymentFinishModule>(module, injector);
        const componentType = moduleRef.instance.resolveFinishContainerComponent();
        const componentRef = this.viewContainerRef.createComponent(componentType, {
          injector: moduleRef.injector,
        });
        const component = componentRef.instance;
        this.store.selectSnapshot(ParamsState.embeddedMode) && containerRef.clear();
        component.cdr.markForCheck();

        component.destroyModal.pipe(
          tap(() => {
            this.viewContainerRef.clear();
          }),
          take(1),
        ).subscribe();
        component.cdr.detectChanges();
      })
    );
  }
}
