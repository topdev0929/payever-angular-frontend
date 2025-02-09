import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Actions, ofActionCompleted, ofActionDispatched } from '@ngxs/store';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { PaymentState, UpdatePayment } from '@pe/checkout/store';

import {
  ScenarioEnum,
  NodePaymentDetailsResponseInterface,
  SantanderNoFlowService,
} from '../../../shared';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-pos-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentDetailsResponseInterface>
  implements OnInit {
  @Input() isBillingAddressStepVisible = false;

  protected isMoreInfoMode = true;
  private santanderNoFlowService = this.injector.get(SantanderNoFlowService);
  private actions$ = this.injector.get(Actions);

  public loading$ = merge(
    this.actions$.pipe(
      ofActionDispatched(UpdatePayment),
      map(() => true)
    ),
    this.actions$.pipe(
      ofActionCompleted(UpdatePayment),
      map(() => false)
    ),
  );

  get isPaymentComplete(): boolean {
    return Boolean(
      this.flow
      && this.nodeFlowService.getFinalResponse<any>()
      && !this.needMoreInfoScenario
      && !this.santanderNoFlowService.isNeedApproval(this.paymentResponse),
    );
  }

  showFinishModalFromExistingPayment(): void {
    this.paymentResponse ||= this.nodeFlowService.getFinalResponse();
    if (!this.paymentResponse) {
      this.errorMessage = this.store.selectSnapshot(PaymentState.error).message;
      this.cdr.markForCheck();
    }

    if (!this.errorMessage) {
      this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().subscribe(() => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
        this.cdr.markForCheck();
      }, (err) => {
        this.errorMessage = err.message || 'Unknown error';
        this.cdr.markForCheck();
      });
    }
  }

  get needMoreInfoScenario(): boolean {
    return Object.values(ScenarioEnum).includes(this.paymentResponse?.payment?.specificStatus as any);
  }
}
