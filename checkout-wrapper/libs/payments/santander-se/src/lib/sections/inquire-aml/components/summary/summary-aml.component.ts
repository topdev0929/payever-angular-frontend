import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { FormInterface } from '../../../../shared/common';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'pe-santander-se-inquire-aml-summary',
  templateUrl: './summary-aml.component.html',
  styles: [`
    :host {
      display: block;
      font-weight: 400;
    }
  `],
  providers: [PeDestroyService],
})
export class SummaryAmlComponent {
  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;
  @SelectSnapshot(PaymentState.form) paymentForm!: FormInterface;
}
