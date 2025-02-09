import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { PeDestroyService } from '@pe/destroy';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'flow-verified-static-success',
  templateUrl: 'success.component.html',
  providers: [PeDestroyService],
})
export class FlowVerifiedStaticSuccessComponent {
  private activatedRoute = inject(ActivatedRoute);

  protected readonly strongOrderNumber = `<strong>${this.orderNumber}</strong>`;
  protected orderNumberText = $localize `:@@flow_common_finish.order_number:${this.strongOrderNumber}:orderNumber:`;

  get orderNumber(): string {
    const params: Params = { ...this.activatedRoute.snapshot.queryParams };

    return params.orderNumber || params.order_number || null;
  }
}
