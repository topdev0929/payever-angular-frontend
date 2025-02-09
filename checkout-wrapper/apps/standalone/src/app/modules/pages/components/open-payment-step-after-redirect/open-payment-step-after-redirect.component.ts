import { Component, ChangeDetectionStrategy, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  AuthSelectors,
  FlowState,
  GetFlow,
  GetSettings,
  ParamsState,
  SetParams,
} from '@pe/checkout/store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'open-payment-step-after-redirect',
  template: '',
})
export class OpenPaymentStepAfterRedirectComponent implements OnInit {

  @SelectSnapshot(AuthSelectors.guestTokenQueryParam)
  private readonly guestTokenQueryParam: Params;

  private activatedRoute = this.injector.get(ActivatedRoute);
  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  private router = this.injector.get(Router);
  private store = this.injector.get(Store);

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    const flowId = this.activatedRoute.snapshot.params.flowId;

    // Have to do restoring here, before first getFlow() request because restored data also can have guest token
    // In this case it works like root route guard
    this.externalRedirectStorage.restoreAndClearData(flowId).pipe(
      switchMap(() =>
        this.store.dispatch([
          new GetFlow(flowId),
        ]).pipe(
          switchMap(() => {
            const { channelSetId } = this.store.selectSnapshot(FlowState.flow);

            return this.store.dispatch(new GetSettings(channelSetId));
          }),
        ),
      ),
      switchMap(() => this.store.dispatch(
        new SetParams({
          ...this.store.selectSnapshot(ParamsState.params),
          redirectToPaymentQueryParams: this.activatedRoute.snapshot.queryParams,
        })
      )),
      switchMap(() =>
        from(
          this.router.navigate(
            [`/pay/${flowId}`],
            {
              queryParams: {
                clientMode: false,
                embeddedMode: false,
                forceNoPaddings: false,
                ...this.guestTokenQueryParam,
                processed: true,
              },
              replaceUrl: true,
            },
          )
        ),
      ),
    ).subscribe();
  }
}
