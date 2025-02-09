import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-error-styles',
  template: '',
  styles: [`
    .pe-checkout-bootstrap pe-error {
      position: absolute;
      left: 0;
      right: 0;
      top: -10px;
      font-size: 10px;
      margin-top: 0;
    }
    .mat-error {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  `],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class FormFieldErrorStylesComponent {

}
