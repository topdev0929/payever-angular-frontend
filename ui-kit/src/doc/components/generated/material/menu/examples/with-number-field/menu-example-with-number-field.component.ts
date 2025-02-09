import { Component } from '@angular/core';

@Component({
  selector: 'doc-menu-example-with-number-field',
  templateUrl: './menu-example-with-number-field.component.html'
})
export class MenuExampleWithNumberFieldComponent {
  testingNumber: number = 0;

  subtract(e: any) {
    if(this.testingNumber) {
      this.testingNumber--;
    }
  }

  add(e: any) {
    this.testingNumber++;
  }

  dontClose(e: any) {
    e.stopPropagation();
  }
}
