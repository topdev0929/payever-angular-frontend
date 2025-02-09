import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';

import { AbstractFlowCommonFinishStaticComponent } from '../abstract-flow-common-finish-static.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'flow-common-finish-static-fail',
  templateUrl: 'flow-common-finish-static-fail.component.html',
  styles: [`
  .static-wrapper p:last-child {
    margin-bottom: 0;
  }
  .go-back-btn {
    width: 115px;
    height: 33px;
    font-size: 12px;
    background: hsla(0,0%,7%,.85);
    color: white;
    border: none;
    border-radius: 3px;
    padding: 0 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .go-back-btn:hover {
    opacity: 0.95;
  }
  `],
  providers: [PeDestroyService],
})
export class FlowCommonFinishStaticFailComponent extends AbstractFlowCommonFinishStaticComponent {
  orderNumberText = $localize `:@@flow_common_finish.order_number:${this.strongOrderNumber}:orderNumber:`;

  public errorMessage = this.activatedRoute.snapshot.queryParams.message;

  private document = this.injector.get(DOCUMENT);

  private webhooks$ = this.activatedRoute.queryParams.pipe(
    map(({ flowId }) => flowId && this.flowStorage.getData(flowId, 'webhooks')),
    shareReplay(1),
  );

  showBack$ = this.webhooks$.pipe(
    map(value => !!value?.failureUrl),
  );

  goBack(): void {
    this.webhooks$.pipe(
      filter(webhooks => webhooks?.failureUrl),
      tap(webhooks => this.document.location.href = webhooks?.failureUrl),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
