import { Component, ChangeDetectionStrategy } from '@angular/core';

import { PeDestroyService } from '@pe/destroy';

import { AbstractFlowCommonFinishStaticComponent } from '../abstract-flow-common-finish-static.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'flow-common-finish-static-cancel',
  templateUrl: 'flow-common-finish-static-cancel.component.html',
  providers: [PeDestroyService],
})
export class FlowCommonFinishStaticCancelComponent extends AbstractFlowCommonFinishStaticComponent {
  public readonly orderNumberText = $localize `:@@flow_common_finish.order_number:${this.strongOrderNumber}:orderNumber:`;
}
