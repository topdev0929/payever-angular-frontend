import { Component } from '@angular/core';
import { PaymentOptionsListItem } from '../../../../../modules/payment-options-list';

@Component({
  selector: 'payment-options-list-doc',
  templateUrl: 'payment-options-list-doc.component.html'
})
export class PaymentOptionsListDocComponent {
  htmlExample: string =  require('raw-loader!./examples/payment-options-list-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/payment-options-list-example-basic.ts.txt');

  paymentOptions: PaymentOptionsListItem[] = [
    {
      name: 'Cash',
      image_primary_filename: 'https:\/\/stage.payever.de\/media\/cache\/payment_option.icon\/f44a44c2b80bfe8813f649232f14cad2.png'
    },
    {
      name: 'Direct Debit',
      image_primary_filename: 'https:\/\/stage.payever.de\/media\/cache\/payment_option.icon\/7e8021774db236b3bec395d05212684e.png'
    },
    {
      name: 'Payex',
      image_primary_filename: 'https:\/\/stage.payever.de\/media\/cache\/payment_option.icon\/f44a44c2b80bfe8813f649232f14cad2.png'
    },
    {
      name: 'Paylater',
      image_primary_filename: 'https:\/\/stage.payever.de\/media\/cache\/payment_option.icon\/7e8021774db236b3bec395d05212684e.png'
    },
    {
      name: 'Paymill',
      image_primary_filename: 'https:\/\/stage.payever.de\/media\/cache\/payment_option.icon\/f44a44c2b80bfe8813f649232f14cad2.png'
    },
    {
      name: 'Paypal',
      image_primary_filename: 'https:\/\/stage.payever.de\/media\/cache\/payment_option.icon\/7e8021774db236b3bec395d05212684e.png'
    }
  ];

  onSelectItem(item: PaymentOptionsListItem) {
    
  }
}
