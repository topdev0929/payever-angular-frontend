import { Component } from '@angular/core';

@Component({
  selector: 'doc-error',
  templateUrl: 'error-doc.component.html'
})
export class ErrorDocComponent {
  htmlExample: string =  require('raw-loader!./examples/error-example-basic.html.txt');

  title: string;
  description: string;
  code: string;

  jsEx1: string = `
<pe-error
  [title]="title"
  [description]="description"
  [code]="code"
></pe-error>
    `;
  jsEx2: string = `
import { Component, Input } from '@angular/core';

@Component({
  selector: 'pe-error',
  styleUrls: ['ui-error.component.scss'],
  templateUrl: 'ui-error.component.html'
})

export class ErrorComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() code: string = '';
}
  `;

  constructor() {
    this.title = `We're sorry`;
    this.description = `Something went wrong in out end.<br />Please try again or contact us for <a href="#">help</a>.`;
    this.code = `500`;
  }
}
