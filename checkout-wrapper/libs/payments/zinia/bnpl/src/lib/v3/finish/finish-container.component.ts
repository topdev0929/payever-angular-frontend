import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';

import {
  AbstractFinishContainer,
  AbstractFinishContainerComponent,
} from '@pe/checkout/finish';
import { ChangePaymentDataInterface } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-bnpl-finish-container-v3',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements OnInit, AbstractFinishContainer {

  // For payment widgets when we have many payments in flow but behave like only one
  @Input() isDisableChangePayment = false;
  @Input() showCloseButton: boolean;

  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();
}
