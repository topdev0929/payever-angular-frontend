import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';

import { AnalyticConsentEventEnum } from '@pe/checkout/analytics';
import { DialogService } from '@pe/checkout/dialog';
import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { TermsFormValue } from '../../../shared';

import {
  ConditionsDialogComponent,
  ConditionsDialogDataInterface,
} from './conditions-dialog';

@Component({
  selector: 'terms-form',
  templateUrl: './terms-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsFormComponent extends CompositeForm<TermsFormValue> {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  private store = this.injector.get(Store);
  private dialogService = this.injector.get(DialogService);

  public readonly analyticConsentEventEnum = AnalyticConsentEventEnum;

  public readonly formGroup = this.fb.group({
    acceptConditions: this.fb.control<boolean>(null, [Validators.requiredTrue]),
  });

  public readonly translations = {
    acceptConditions: $localize `:@@santander-se.inquiry.form.accept_conditions.label:`,
  };

  public onLabelClick(event: MouseEvent): void {
    if (event?.composedPath?.()[0] && (event.composedPath()[0] as any)['nodeName'] === 'A') {
      event.preventDefault();
      const formData = this.store.selectSnapshot(PaymentState.form);
      const { campaignCode } = formData.ratesForm || {};

      if (campaignCode) {
        const data: ConditionsDialogDataInterface = {
          code: campaignCode,
          flowId: this.flow.id,
        };
        this.dialogService.open(ConditionsDialogComponent, null, data);
      }
    }
  }
}
