import { ChangeDetectionStrategy, Component, Input, NgZone, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import {
  NodePaymentDetailsResponseInterface,
  SantanderDePosFlowService,
  CommonService,
  SantanderDePosApiService,
  BaseFinishContainerComponent,
  DocsManagerService,
  docsManagerServiceFactory,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowStateEnum, NodePaymentResponseInterface } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CommonService,
    SantanderDePosFlowService,
    SantanderDePosApiService,
    { 
      provide: DocsManagerService,
      useFactory: docsManagerServiceFactory,
    },
  ],
  selector: 'santander-de-pos-inquire-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends BaseFinishContainerComponent
  implements OnInit {
  // For compatibility with AbstractFinishContainerComponent
  @Input() isBillingAddressStepVisible = false;

  private ngZone = this.injector.get(NgZone);

  minHeightValue = 250;
  timeoutRequest = false;
  isNeedUpdating = true;

  protected get isPaymentComplete(): boolean {
    const paymentResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>
      = this.nodeFlowService.getFinalResponse();

    return Boolean(this.flow
      && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0)
      && !this.isPaymentUpdateRequired(paymentResponse);
  }

  showFinishModalFromExistingPayment(): void {
    this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().subscribe((payment) => {
      this.paymentResponse = payment;
      this.cdr.detectChanges();
    }, (err) => {
      this.errorMessage = err.message;
      this.cdr.detectChanges();
    });
  }

  onChangeContainerHeight(height: number): void {
    this.ngZone.onStable.pipe(
      first(),
      tap({
        next: () => {
          this.minHeightValue = height;
          this.cdr.markForCheck();
        },
      }),
    ).subscribe();
  }

  protected paymentCallback(): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    return this.runUpdatePaymentWithTimeout();
  }
}
