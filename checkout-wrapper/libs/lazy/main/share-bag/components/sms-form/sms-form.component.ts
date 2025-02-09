import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';

import { BaseFormComponent } from '../base-form';

@Component({
  selector: 'sms-form',
  templateUrl: './sms-form.component.html',
  styleUrls: ['../base-form/base-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmsFormComponent extends BaseFormComponent {
  formGroup = this.fb.group({
    recipient: [null, Validators.required],
  }, { updateOn: 'submit' });

  translations = {
    sms: $localize `:@@checkout_sdk.qr_share.sms.placeholder:`,
    shareSms: $localize `:@@checkout_sdk.qr_share.sms.text:`,
    invalidPhone: $localize `:@@checkout_sdk.qr_share.sms.error:`,
    successSnackbar: $localize `:@@checkout_sdk.qr_share.sms.successSnackbar:SMS sent successfully!`,
  };
}
