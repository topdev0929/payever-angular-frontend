import { Component } from '@angular/core';
import { PaymentOptionsListItem } from '../../../../../modules/payment-options-list';

@Component({
  selector: 'payment-option-doc',
  templateUrl: 'payment-option-doc.component.html'
})
export class PaymentOptionDocComponent {
  htmlExample: string =  require('raw-loader!./examples/payment-option-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/payment-option-example-basic.ts.txt');

  iconPng = require('../../../assets/img/9bfd251af24107ac3bcf2a41b5ba0228.png');

  private paymentOptions: PaymentOptionsListItem[] = [
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
    },
  ];

  html1 = `
<div class="row">
  <div class="col-xs-6">
    <pe-payment-option
      title="SOFORT Banking"
      linkTitle="Edit"
      [iconPng]="iconPng"
      [hasSwitch]="true"
      [switchOn]="true"
      (onSwitchToggle)="handleSwitchToggle($event)"
      (onLinkClick)="handleLinkClick($event)"
      ></pe-payment-option>
  </div>
  <div class="col-xs-6">
    <pe-payment-option
      title="PayPal"
      linkTitle="Add payment"
      iconPng="https://stage.payever.de/media/cache/payment_option.icon/18de526e7ef2103cc3588c6c4239c544.png"
      (onLinkClick)="handleLinkClick($event)"
      ></pe-payment-option>
  </div>
</div>
  `;

  js1 =  `
iconPng = require('../../../assets/img/9bfd251af24107ac3bcf2a41b5ba0228.png');

handleSwitchToggle(switchOn: boolean) {
  
}

handleLinkClick(e: Event) {
  
}
  `;

  html2 = `
import { PaymentOptionsListItem } from '../../../../../modules/payment-options-list';

<pe-payment-options-list
  [itemsList]="paymentOptions"
  (selectItemEvent)="onSelectItem($event)"></pe-payment-options-list>
  `;

  js2 =  `
private paymentOptions: PaymentOptionsListItem[] = [
  {
    name: 'Cash',
    image_primary_filename: 'https:\/\/stage.payever.de\/media\/cache\/payment_option.icon\/f44a44c2b80bfe8813f649232f14cad2.png',
  },
  ...
];
  `;

  handleSwitchToggle(switchOn: boolean) {
    
  }

  handleLinkClick(e: Event) {
    
  }

  onSelectItem(item: PaymentOptionsListItem) {
    
  }
}
