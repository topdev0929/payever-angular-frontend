import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  ViewEncapsulation,
  createNgModule,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, from, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthInterceptor } from '@pe/auth';
import { CreateFlowParamsInterface } from '@pe/checkout/api';
import { CartItemInterface } from '@pe/checkout/types';
import type { CheckoutWrapperByChannelSetIdComponent } from '@pe/checkout/web-components/channel-set';
import { PeDestroyService } from '@pe/destroy';

import { BaseCheckoutWrapperComponent } from '../shared';

/** Main goal of this component is to:
 * - get input params
 * - get output events from children and dispatch them as outputs
 * - "bootstrap" our application - we're uploading translations here instead of guards, etc.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'pe-checkout-wrapper-by-channel-set-id',
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
export class PeCheckoutWrapperByChannelSetIdComponent extends BaseCheckoutWrapperComponent {

  reCreateFlow$ = new EventEmitter<void>();
  @Input('recreateflow') set setReCreateFlow(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.reCreateFlow$.next(this.parseInputEventEmit(value));
    }
  }

  reCreateFlowAndResetCart$ = new EventEmitter<void>();
  @Input('recreateflowandresetcart') set setReCreateFlowAndResetCart(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.reCreateFlowAndResetCart$.next(this.parseInputEventEmit(value));
    }
  }

  createFlowParams$ = new BehaviorSubject<CreateFlowParamsInterface>(null);
  @Input('createflowparams') set setCreateFlowParams(value: any) {
    this.createFlowParams$.next(this.parseInputObject(value));
  }

  cart$ = new BehaviorSubject<CartItemInterface[]>(null);
  @Input('cart') set setCart(value: any) {
    this.cart$.next(this.parseInputObject(value));
  }

  hideCreateFlowErrors$ = new BehaviorSubject<boolean>(false);
  @Input('hidecreateflowerrors') set setHideCreateFlowErrors(value: any) {
    this.hideCreateFlowErrors$.next(this.parseInputBoolean(value));
  }

  protected loadComponent(containerRef: ViewContainerRef) {
    return from(
      import('@pe/checkout/web-components/channel-set')
      .then(m => m.CeChannelSetModule)
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

  protected customInit = (instance: CheckoutWrapperByChannelSetIdComponent) => merge(
      this.createFlowParams$.pipe(tap(value => instance.setCreateFlowParams = value)),
      this.cart$.pipe(tap(value => instance.setCart = value)),
      this.hideCreateFlowErrors$.pipe(tap(value => instance.setHideCreateFlowErrors = value)),
      this.reCreateFlow$.pipe(tap(value => instance.setReCreateFlow = value)),
      this.reCreateFlowAndResetCart$.pipe(tap(value => instance.setReCreateFlowAndResetCart = value)),
    ).pipe(
      tap(() => instance.cdr.markForCheck()),
    );
}
