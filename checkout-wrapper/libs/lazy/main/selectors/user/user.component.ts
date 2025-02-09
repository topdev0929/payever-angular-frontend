import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractFlowIdComponent } from '@pe/checkout/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-user',
  template: `
  <checkout-main-user-check
    *ngIf="guestMode"
    (toLogin)="guestMode = false">
  </checkout-main-user-check>
  <checkout-main-user-login
    *ngIf="!guestMode"
    (toGuest)="guestMode = true">
  </checkout-main-user-login>
  `,
})
export class UserComponent extends AbstractFlowIdComponent {
  public guestMode = true;
}
