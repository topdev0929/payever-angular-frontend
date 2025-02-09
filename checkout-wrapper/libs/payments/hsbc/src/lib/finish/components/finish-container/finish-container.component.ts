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
  selector: 'hsbc-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentDetailsResponseInterface>
  implements OnInit {

  @Input() asSinglePayment = false;

  showFinishModalFromExistingPayment(): void {
    super.showFinishModalFromExistingPayment();

    if (this.paymentResponse) {
      this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().subscribe((response) => {
        this.paymentResponse = response;
        this.cdr.detectChanges();
      }, (err) => {
        this.errorMessage = err.message || $localize `:@@error.unknown_error:`;
        this.cdr.detectChanges();
      });
    }
  }
}
