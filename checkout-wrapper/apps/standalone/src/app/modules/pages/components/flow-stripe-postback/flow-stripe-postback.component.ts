import { Component, Injector, OnInit } from '@angular/core';

const BANK_VERIFY_COMPLETE_EVENT: any = 'StripeCreditCardVerifyCompleted';

@Component({
  selector: 'flow-stripe-postback',
  template: '',
})
export class FlowStripePostbackComponent implements OnInit {

  constructor(protected injector: Injector) {}

  ngOnInit(): void {
    window.parent.postMessage({ event: BANK_VERIFY_COMPLETE_EVENT }, '*');
  }
}
