import { Component, ChangeDetectionStrategy, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, switchMap } from 'rxjs/operators';

import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { CloneFlow, FlowState, GetSettings, OpenStep, SetPaymentComplete, SetSteps } from '@pe/checkout/store';
import { FlowCloneReason, SectionType } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'open-choose-payment-step-after-redirect',
  template: '',
})
export class OpenChoosePaymentStepAfterRedirectComponent implements OnInit {
  private activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  private store = this.injector.get(Store);
  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);

  constructor(private injector: Injector) {
  }

  ngOnInit(): void {
    const flowId: string = this.activatedRoute.snapshot.params.flowId;

    this.store.dispatch(new CloneFlow({
      flowId,
      skipData: true,
      reason: FlowCloneReason.ChangeNonFinishedPayment,
      redirect: true,
    })).pipe(
      switchMap(() => {
        const { channelSetId } = this.store.selectSnapshot(FlowState.flow);

        return this.store.dispatch(new GetSettings(channelSetId));
      }),
      switchMap(() => this.externalRedirectStorage.getDataByFlowId(flowId).pipe(
        map(d => d ?? {}),
        switchMap(({ storage }) => {
          if (storage?.steppermanagersteps) {
            this.store.dispatch(new SetSteps(storage.steppermanagersteps));
          }

          return this.store.dispatch([
            new SetPaymentComplete(false),
            new OpenStep(SectionType.ChoosePayment),
          ]);
        }),
      )),
    ).subscribe();
  }
}
