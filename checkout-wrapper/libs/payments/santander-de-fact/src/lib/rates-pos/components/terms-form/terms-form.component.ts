import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { DialogService } from '@pe/checkout/dialog';
import { openLabelModal } from '@pe/checkout/form-utils';
import { CompositeForm } from '@pe/checkout/forms';
import { FlowState } from '@pe/checkout/store';
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
export class TermsFormComponent extends CompositeForm<TermsFormValue> implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  private dialogService = this.injector.get(DialogService);

  public formGroup = this.fb.group({
    conditionsAccepted: this.fb.control<boolean>(null, Validators.required),
    advertisingAccepted: this.fb.control<boolean>(null),
  });

  public readonly translations = {
    advertisingAccepted: {
      label: $localize `:@@inquiry.form.advertising_accepted.label:`,
    },
  };

  ngOnInit(): void {
    this.formGroup.get('conditionsAccepted').setValue(true);
  }

  public advertisingAcceptedClicked(event: MouseEvent): void {
    openLabelModal(event, this.dialogService, {
      attributeName: 'href',
      attributeValue: 'communication',
      flowId: this.flow.id,
      title: $localize `:@@inquiry.form.advertising_accepted.details.title:`,
      text: $localize `:@@inquiry.form.advertising_accepted.details.text:`,
    });
  }
}
