import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ModeEnum } from '@pe/checkout/form-utils';
import { ExternalNavigateData } from '@pe/checkout/storage';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { TYPE_CREDIT_Z } from '../../../../shared';

@Component({
  selector: 'santander-no-inquire-credit-form',
  templateUrl: './credit-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditFormComponent
  implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @Input() mode: ModeEnum;

  @Output() submitted = new EventEmitter<void>();

  public readonly modeEnum = ModeEnum;

  constructor(
    private externalNavigateData: ExternalNavigateData,
  ) {}

  ngOnInit(): void {
    this.externalNavigateData.extractFromUrlAndSave(this.flow.id);

    const type = this.externalNavigateData.getValue(this.flow.id, 'type');
    
    if (type === TYPE_CREDIT_Z) {
      this.submitted.emit();
    }
  }

  submit() {
    this.submitted.emit();
  }

}
