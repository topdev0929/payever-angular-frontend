import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';

import { NodePaymentDetailsResponseInterface } from '../../../shared/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-at-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentDetailsResponseInterface>
  implements OnInit {

  @Input() asSinglePayment = false;

  showFinishModalFromExistingPayment(): void {
    super.showFinishModalFromExistingPayment();

    if (this.paymentResponse) {
      this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().subscribe(() => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
        this.cdr.detectChanges();
      }, (err) => {
        this.errorMessage = err.message || 'Unknown error';
        this.cdr.detectChanges();
      });
    }
  }
}
