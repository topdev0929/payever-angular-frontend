import { Component, HostBinding, Input } from '@angular/core';

import { openOverlayAnimation } from '@pe/common';

import { CheckoutModalActionsInterface } from '../types/navbar-controls.type';

@Component({
  selector: 'pe-checkout-modal',
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss'],
  animations: [openOverlayAnimation],
})
export class CheckoutModalComponent {

  @Input() title = '';
  @Input() topOffset: string;
  @Input() leftOffset: string;
  @Input() width: string;
  @Input() height: string;
  @Input() maxWidth: string;
  @Input() maxHeight: string;
  @Input() leftSideActions: CheckoutModalActionsInterface[] = [];
  @Input() rightSideActions: CheckoutModalActionsInterface[] = [];
  @HostBinding('@overlayAnimation') animatedMenu = true;
}
