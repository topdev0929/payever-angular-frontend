import { Component } from '@angular/core';

@Component({
  selector: 'doc-number-field-example-large',
  templateUrl: './number-field-example-large.component.html',
  styleUrls: ['./number-field-example-large.component.scss']
})
export class NumberFieldExampleLargeComponent {
  testingNumber: number = 0;

  add() {
    this.testingNumber++;
  }

  subtract() {
    if(this.testingNumber) {
      this.testingNumber--;
    }
  }
}
