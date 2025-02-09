import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Cookie from 'js-cookie';

import { LoaderService } from '@pe/checkout/core/loader';

@Component({
  template: '',
})
export class SetCookieAndRedirectComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    // This logic is needed to solve Safari iframe issue
    // https://gist.github.com/iansltx/18caf551baaa60b79206
    this.loaderService.loaderGlobal = true;
    Cookie.set('safari_is_killing_me', '1');
    const url = this.activatedRoute.snapshot.queryParams.url;
    window.top.location.href = url;
  }
}
