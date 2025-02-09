import { Component } from '@angular/core';

@Component({
  selector: 'ui-icons-payment-methods',
  templateUrl: '../../../../../icons/icons-payment-methods.html'
})
export class IconsPaymentMethodsComponent {
  santanderIconsOldIds: string[] = [
    'payment-method-santander_installment_dk',
    'payment-method-santander_installment_no',
    'payment-method-santander_installment_se',
    'payment-method-santander_invoice_no',
    'payment-method-santander_pos_installment_dk',
    'payment-method-santander_pos_installment_no',
    'payment-method-santander_pos_installment_se',
    'payment-method-santander_pos_invoice_no'
  ];
  
  santanderIconsNewIds: string[] = [
    'payment-method-santander_installment',
    'payment-method-santander_factoring_de',
    'payment-method-santander_ccp_installment',
    'payment-method-santander_invoice_de',
    'payment-method-santander_pos_installment'
  ];
}
