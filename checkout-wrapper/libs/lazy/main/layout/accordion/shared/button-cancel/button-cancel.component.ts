import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';

import { FinishFlowService } from '@pe/checkout/core';
import { TopLocationService } from '@pe/checkout/location';
import { ParamsState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-button-cancel',
  template: `
    <button
      class="btn btn-default pe-truncate-text btn-sm"
      [ngClass]="{'mat-button-secondary': !isDefault}"
      [style.max-width.%]="100"
      [innerHtml]="buttonText"
      (click)="onButtonClick()"
      >
    </button>
  `,
  styles: [`
    :host {
      display: flex;
    }
    .mat-button-secondary {
      font-size: 12px;
      line-height: 36px;
      height: 36px;
      padding: 0 20px;
    }
    @media (max-width: 380px) {
      .mat-button-secondary  {
        font-size: 8px;
        line-height: 30px;
        height: 30px;
        padding: 0px 10px;
      }
    }
  `],
  providers: [PeDestroyService],
})
export class ButtonCancelComponent {

  private readonly topLocationService= inject(TopLocationService);
  private readonly finishFlowService= inject(FinishFlowService);

  @ViewSelectSnapshot(ParamsState.merchantMode) merchantMode: boolean;

  @ViewSelectSnapshot(ParamsState.embeddedMode) embeddedMode: boolean;

  @Input() flow: FlowInterface;

  @Input() buttonText: string;

  @Input() isDefault: boolean;

  @Input() isInIframe: boolean;

  onButtonClick(): void {
    if ((this.embeddedMode && this.isInIframe) 
    || this.merchantMode
    || !this.flow.apiCall.cancelUrl) {
      this.finishFlowService.closeCheckout(this.flow);
    } else {
      this.topLocationService.href = this.flow.apiCall.cancelUrl;
    }
  }
}
