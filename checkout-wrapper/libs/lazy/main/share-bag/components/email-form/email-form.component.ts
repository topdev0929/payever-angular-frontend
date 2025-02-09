import { ChangeDetectionStrategy, Component } from '@angular/core';

import { emailRequiredValidator } from '@pe/checkout/forms/email';

import { BaseFormComponent } from '../base-form';

@Component({
  selector: 'email-form',
  templateUrl: './email-form.component.html',
  styleUrls: ['../base-form/base-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailFormComponent extends BaseFormComponent {
  formGroup = this.fb.group({
    email: [null, [emailRequiredValidator]],
  }, { updateOn: 'submit' });

  translations = {
    email: $localize `:@@checkout_sdk.qr_share.email.placeholder:`,
    shareEmail: $localize `:@@checkout_sdk.qr_share.email.text:`,
    invalidEmail: $localize `:@@checkout_sdk.qr_share.email.error:`,
    successSnackbar: $localize `:@@checkout_sdk.qr_share.email.successSnackbar:E-mail sent successfully!`,
  };
}
