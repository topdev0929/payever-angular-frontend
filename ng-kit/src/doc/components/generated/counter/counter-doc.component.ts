import { Component } from '@angular/core';

@Component({
  selector: 'counter-doc',
  templateUrl: 'counter-doc.component.html',
})
export class CounterDocComponent {
  htmlExample: string =  require('raw-loader!./examples/counter-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/counter-example-basic.ts.txt');

  handleCounterValue(value: number): void {
    
  }
}
