import { Component } from '@angular/core';

@Component({
  selector: 'doc-select',
  templateUrl: './select-doc.component.html'
})
export class SelectDocComponent {
  selectDefaultExampleTemplate: string = require('!!raw-loader!./examples/select-default-example/select-default-example.component.html');
  selectDefaultExampleComponent: string = require('!!raw-loader!./examples/select-default-example/select-default-example.component.ts');

  selectGroupExampleTemplate: string = require('!!raw-loader!./examples/select-group-example/select-group-example.component.html');
  selectGroupExampleComponent: string = require('!!raw-loader!./examples/select-group-example/select-group-example.component.ts');

  selectCountryExampleTemplate: string = require('!!raw-loader!./examples/select-country-example/select-country-example.component.html');
  selectCountryExampleComponent: string = require('!!raw-loader!./examples/select-country-example/select-country-example.component.ts');
}
