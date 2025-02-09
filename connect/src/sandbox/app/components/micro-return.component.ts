import { Component, Injector } from '@angular/core';

import { MessageBus } from '@pe/common';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'micro-return',
  template: ``
})
export class MicroReturnComponent {

  constructor(
    private injector: Injector
  ) {}

  ngOnInit(): void {
    const messageBus = this.injector.get(MessageBus);
    messageBus.emit('connect.navigate-to-app', 'checkout');
  }

}
