import { Component } from '@angular/core';
import { RateOption } from '../../../../../modules/rate';

@Component({
  selector: 'rate-doc',
  templateUrl: 'rate-doc.component.html'
})
export class RateDocComponent {
  htmlExample: string =  require('raw-loader!./examples/rate-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/rate-example-basic.ts.txt');

  rateOptions: RateOption[] = [
    { label: 'Months:', val: '1 Month' },
    { label: 'Credit purchase:', val: '1678 NOK' }
  ];

  handleRateSelect(isSelected: boolean): void {
    
  }

  handleEdit(): void {
    
  }
}
