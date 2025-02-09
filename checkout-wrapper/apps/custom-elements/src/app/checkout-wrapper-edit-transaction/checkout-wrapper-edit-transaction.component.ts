import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
  createNgModule,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, from, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthInterceptor } from '@pe/auth';
import { AddressInterface } from '@pe/checkout/types';
import type { CheckoutWrapperEditTransactionComponent } from '@pe/checkout/web-components/edit';
import { PeDestroyService } from '@pe/destroy';

import { BaseCheckoutWrapperComponent } from '../shared';

/** Main goal of this component is to:
 * - get input params
 * - get output events from children and dispatch them as outputs
 * - "bootstrap" our application - we're uploading translations here instead of guards, etc.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-checkout-wrapper-edit-transaction',
  template: '<ng-template #container></ng-template>',
  styleUrls: [
    '../../../../../libs/shared/styles/assets/ui-kit-styles/pe_style.scss',
  ],
  providers: [
    PeDestroyService,
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: AuthInterceptor,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class PeCheckoutWrapperEditTransactionComponent extends BaseCheckoutWrapperComponent {

  flowId$ = new BehaviorSubject<string>(null);
  @Input('flowid') set setFlowId(value: any) {
    this.flowId$.next(this.parseInputString(value));
  }

  transactionId$ = new BehaviorSubject<string>(null);
  @Input('transactionid') set setTransactionPayment(value: any) {
    this.transactionId$.next(this.parseInputString(value));
  }

  billingAddress$ = new BehaviorSubject<AddressInterface>(null);
  @Input('billingAddress') set setBillingAddress(value: any) {
    this.billingAddress$.next(this.parseInputObject(value));
  }

  protected loadComponent(containerRef: ViewContainerRef) {
    return from(
      import('@pe/checkout/web-components/edit')
      .then(m => m.CeEditModule)
      .then((module) => {
        const moduleRef = createNgModule(module, this.injector);
        const componentType = moduleRef.instance.resolveComponent();
        const component = containerRef.createComponent<any>(componentType, {
          index: 0,
          injector: moduleRef.injector,
        });

        return component;
      }),
    );
  }

  protected customInit = (instance: CheckoutWrapperEditTransactionComponent) => merge(
      this.flowId$.pipe(tap(value => instance.setFlowId = value)),
      this.transactionId$.pipe(tap(value => instance.setTransactionId = value)),
      this.billingAddress$.pipe(tap(value => instance.setBillingAddress = value)),
    );
}
