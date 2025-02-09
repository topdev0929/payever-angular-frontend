import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoaderService } from '@pe/checkout/core/loader';

@Component({
  selector: 'checkout-error404',
  template: `
  <div class="container-fluid">
    <div class="headline">Error!</div>
    <div class="message">{{ message }}</div>
  </div>
  `,
  styles: [`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      align-items: center;
      justify-content: center;
    }

    .headline {
      font-size: 27px;
      font-weight: 700;
      line-height: 28px;
      letter-spacing: 0.3px;
      margin-bottom: 16px;
      text-align: center;
    }

    .message {
      font-size: 16px;
      font-weight: 400;
      line-height: 23px;
      letter-spacing: 0px;
      text-align: center;
    }
  `],
})
export class Error404Component implements OnInit {

  message = this.router.getCurrentNavigation().extras.state?.message
    || $localize `:@@errors.pageNotFound:Page not found`;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
  ) {
  }

  ngOnInit(): void {
    this.loaderService.loaderGlobal = false;
  }
}
