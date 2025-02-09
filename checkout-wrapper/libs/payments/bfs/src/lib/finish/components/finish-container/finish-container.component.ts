import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';

import { BfsFlowService } from '../../../shared/service';
import { NodePaymentDetailsResponseInterface } from '../../../shared/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'bfs-finish-container',
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

  private bfsFlowService = this.injector.get(BfsFlowService);

  showFinishModalFromExistingPayment(): void {
    super.showFinishModalFromExistingPayment();

    if (this.paymentResponse) {
      this.bfsFlowService.getPayment<NodePaymentDetailsResponseInterface>().subscribe(() => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
        this.cdr.detectChanges();
      }, (err) => {
        this.errorMessage = err.message || $localize `:@@error.unknown_error:`;
        this.cdr.detectChanges();
      });
    }
  }
}
