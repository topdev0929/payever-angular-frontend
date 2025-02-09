import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { PlatformService } from '@pe/ng-kit/modules/common';

@Component({
  selector: 'micro-return',
  template: ``
})
export class MicroReturnComponent {

  constructor(
    private platformService: PlatformService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.platformService.dispatchEvent({
      target: 'browser_back_event',
      action: this.router.url
    });
  }

}
