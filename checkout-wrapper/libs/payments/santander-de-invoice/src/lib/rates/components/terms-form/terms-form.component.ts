import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { DialogService } from '@pe/checkout/dialog';
import { openLabelModal } from '@pe/checkout/form-utils';
import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, ParamsState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

interface TermsFormValue {
  conditionsAccepted: boolean;
  advertisingAccepted: boolean;
  _customerInformation: boolean;
  _customerActs: boolean;
}

@Component({
  selector: 'terms-form',
  templateUrl: './terms-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsFormComponent extends CompositeForm<TermsFormValue> {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @SelectSnapshot(ParamsState.merchantMode) protected merchantMode!: boolean;

  private dialogService = this.injector.get(DialogService);

  public formGroup = this.fb.group({
    conditionsAccepted: [true, Validators.required],
    advertisingAccepted: [
      null,
      [
        Validators.required,
        ...this.merchantMode ? [Validators.requiredTrue] : [],
      ],
    ],
    _customerInformation: [{ disabled: !this.merchantMode, value: null }, Validators.required],
    _customerActs: [{ disabled: !this.merchantMode, value: null }, Validators.required],
  });

  public readonly translations = {
    advertisingAccepted: {
      text: $localize `:@@santander-de-invoice.inquiry.form.advertising_accepted.text:`,
      label: $localize `:@@santander-de-invoice.inquiry.form.advertising_accepted.label:`,
    },
    customerInformation: {
      label: $localize `:@@santander-de-invoice.inquiry.form.customer_information.label:`,
    },
    customerActs: {
      label: $localize `:@@santander-de-invoice.inquiry.form.customer_acts.label:`,
    },
  };

  public advertisingAcceptedClicked(event: MouseEvent): void {
    openLabelModal(event, this.dialogService, {
      attributeName: 'href',
      attributeValue: 'communication',
      flowId: this.flow.id,
      title: $localize `:@@santander-de-invoice.inquiry.form.advertising_accepted.details.title:`,
      text: $localize `:@@santander-de-invoice.inquiry.form.advertising_accepted.details.text:`,
    });
  }

  public customerActsClicked(event: MouseEvent): void {
    openLabelModal(event, this.dialogService, {
      attributeName: 'class',
      attributeValue: 'info',
      flowId: this.flow.id,
      title: $localize `:@@santander-de-invoice.inquiry.form.customer_acts.details.title:`,
      text: $localize `:@@santander-de-invoice.inquiry.form.customer_acts.details.text:`,
    });
  }
}
