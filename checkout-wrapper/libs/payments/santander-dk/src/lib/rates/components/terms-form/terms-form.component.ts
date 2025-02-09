import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { AnalyticConsentEventEnum } from '@pe/checkout/analytics';
import { DialogService } from '@pe/checkout/dialog';
import { openLabelModal } from '@pe/checkout/form-utils';
import { CompositeForm } from '@pe/checkout/forms';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import { TermsFormValue } from '../../../shared';

@Component({
  selector: 'terms-form',
  templateUrl: './terms-form.component.html',
  styles: [`
    .checkbox-field { padding: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsFormComponent extends CompositeForm<TermsFormValue> {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  private dialogService = this.injector.get(DialogService);

  public readonly analyticConsentEventEnum = AnalyticConsentEventEnum;

  public formGroup = this.fb.group({
    digitalConsent: [false],
    acceptBusinessTerms: [false, Validators.requiredTrue],
  });

  public readonly translations = {
    digitalConsent: $localize `:@@santander-dk.inquiry.form.marketing_consent.label:`,
    acceptBusinessTerms: $localize `:@@santander-dk.inquiry.form.accept_business_terms.label:`,
  };

  public onAcceptBusinessTermsClick(event: MouseEvent): void {
    openLabelModal(event, this.dialogService, {
      flowId: this.flow.id,
      title: $localize `:@@santander-dk.inquiry.form.accept_business_terms.details.title:`,
      text: $localize `:@@santander-dk.inquiry.form.accept_business_terms.details.text:`,
    });
  }
}
