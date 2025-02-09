import { Component } from '@angular/core';

@Component({
  selector: 'doc-number-field-example-default',
  templateUrl: './number-field-example-default.component.html',
  styleUrls: ['./number-field-example-default.component.scss']
})
export class NumberFieldExampleDefaultComponent {
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
