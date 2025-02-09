import { Component, Input } from '@angular/core';

import { CheckoutModalActionsInterface } from '../types/navbar-controls.type';

@Component({
  selector: 'pe-checkout-modal',
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss']
})
export class CheckoutModalComponent {

  @Input() title: string = '';
  @Input() topOffset: string;
  @Input() leftOffset: string;
  @Input() width: string;
  @Input() height: string;
  @Input() maxWidth: string;
  @Input() maxHeight: string;
  @Input() leftSideActions: CheckoutModalActionsInterface[] = [];
  @Input() rightSideActions: CheckoutModalActionsInterface[] = [];
}
