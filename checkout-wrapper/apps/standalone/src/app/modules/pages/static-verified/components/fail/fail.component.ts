import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'flow-verified-static-fail',
  templateUrl: 'fail.component.html',
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
export class FlowVerifiedStaticFailComponent {
  private document = inject(DOCUMENT);
  private activatedRoute = inject(ActivatedRoute);
  private flowStorage = inject(FlowStorage);
  private destroy$ = inject(PeDestroyService);

  protected errorMessage = this.activatedRoute.snapshot.queryParams.message;
  protected readonly strongOrderNumber = `<strong>${this.orderNumber}</strong>`;
  protected orderNumberText = $localize `:@@flow_common_finish.order_number:${this.strongOrderNumber}:orderNumber:`;

  get orderNumber(): string {
    const params: Params = { ...this.activatedRoute.snapshot.queryParams };

    return params.orderNumber || params.order_number || null;
  }


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
