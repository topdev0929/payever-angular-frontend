import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { AuthSelectors } from '@pe/checkout/store/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-fix-route',
  template: '',
})
export class FixRouteComponent implements OnInit {

  @SelectSnapshot(AuthSelectors.guestTokenQueryParam)
  private readonly guestTokenQueryParam: Params;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    // eslint-disable-next-line no-console
    console.warn('Starting navigation to correct route...');
    this.router.navigate(
      [`/pay/${this.activatedRoute.snapshot.params.flowId}`],
      {
        queryParams: this.guestTokenQueryParam,
        replaceUrl: true,
      },
    );
  }
}
