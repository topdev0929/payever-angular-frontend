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
import { FinExpApiCallInterface } from '@pe/checkout/api';
import type { CheckoutWrapperByChannelSetIdFinExpComponent } from '@pe/checkout/web-components/finexp';
import { PeDestroyService } from '@pe/destroy';

import { BaseCheckoutWrapperComponent } from '../shared';

export interface FinExpCreateFlowParamsInterface {
  channelSetId: string;
  apiCallData: FinExpApiCallInterface;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'pe-checkout-wrapper-by-channel-set-id-finexp',
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
export class PeCheckoutWrapperByChannelSetIdFinExpComponent extends BaseCheckoutWrapperComponent {

  createFlowFinExpParams$ = new BehaviorSubject<FinExpCreateFlowParamsInterface>(null);
  @Input('finexpcreateflowparams') set setCreateFlowFinExpParams(value: any) {
    this.createFlowFinExpParams$.next(this.parseInputObject(value));
  }

  hideCreateFlowErrors$ = new BehaviorSubject<boolean>(false);
  @Input('hidecreateflowerrors') set setHideCreateFlowErrors(value: any) {
    this.hideCreateFlowErrors$.next(this.parseInputBoolean(value));
  }

  protected loadComponent(containerRef: ViewContainerRef) {
    return from(
      import('@pe/checkout/web-components/finexp')
      .then(m => m.CeFinexpModule)
      .then((module) => {
        const moduleRef = createNgModule(module, this.injector);
        const componentType = moduleRef.instance.resolveComponent();
        const component = containerRef.createComponent(componentType, {
          index: 0,
          injector: moduleRef.injector,
        });

        return component;
      }),
    );
  }

  protected customInit = (instance: CheckoutWrapperByChannelSetIdFinExpComponent) => merge(
      this.createFlowFinExpParams$.pipe(tap(value => instance.setCreateFlowFinExpParams = value)),
      this.hideCreateFlowErrors$.pipe(tap(value => instance.setHideCreateFlowErrors = value)),
    );
}
