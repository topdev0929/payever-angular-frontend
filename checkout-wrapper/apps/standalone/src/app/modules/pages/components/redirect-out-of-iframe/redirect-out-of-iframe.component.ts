import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoaderService } from '@pe/checkout/core/loader';
import { LocaleConstantsService } from '@pe/checkout/utils';

@Component({
  template: '',
})
export class RedirectOutOfIframeComponent implements OnInit {

  constructor(
    protected localeConstantsService: LocaleConstantsService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.loaderGlobal = true;
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const query: string[] = [];
    for (const p in queryParams) {
      if (Object.prototype.hasOwnProperty.call(queryParams, p)) {
        query.push(`${encodeURIComponent(p)}=${encodeURIComponent(queryParams[p])}`);
      }
    }
    window.top.location.href = `/${this.localeConstantsService.getLang()}/pay/${this.activatedRoute.snapshot.params.flowId}?${query.join('&')}`;
  }
}
