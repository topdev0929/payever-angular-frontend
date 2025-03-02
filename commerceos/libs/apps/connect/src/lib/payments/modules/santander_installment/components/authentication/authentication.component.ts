import { Component } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  BaseAuthVendorNumberPasswordComponent,
} from '../../../shared/components/base-auth-vendorNumber-password/base-auth-vendorNumber-password.component';

@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth/base-auth.component.html',
  styleUrls: ['./../../../shared/components/base-auth/base-auth.component.scss'],
})
export class SantanderInstallmentAuthenticationComponent extends BaseAuthVendorNumberPasswordComponent {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_INSTALLMENT;

  getVendorNumberValidator(): any { // TODO Type
    return (control: AbstractControl): {} => {
      const first: string = (control.value || '').substr(0, 1);

      return first === '' || first === '3' ? null : {
        pattern: {
          valid: false,
        },
      };
    };
  }
}
