import { Component } from '@angular/core';

@Component({
  selector: 'price-doc',
  templateUrl: 'price-doc.component.html'
})
export class PriceDocComponent {
  htmlExample: string =  require('raw-loader!./examples/price-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/price-example-basic.ts.txt');

  handlePriceValue(event: any) {

  }
}
