import { Component } from '@angular/core';

@Component({
  selector: 'doc-number-field-example-rounded',
  templateUrl: './number-field-example-rounded.component.html',
  styleUrls: ['./number-field-example-rounded.component.scss']
})
export class NumberFieldExampleRoundedComponent {
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
