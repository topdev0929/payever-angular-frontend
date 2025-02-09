import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MessageBus } from '@pe/common';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'micro-return',
  template: ``
})
export class MicroReturnComponent {

  constructor(
    private router: Router,
    private messageBus: MessageBus,
  ) {}

  ngOnInit(): void {
    this.messageBus.emit('checkout.navigate-to-app', 'checkout');
  }

}
