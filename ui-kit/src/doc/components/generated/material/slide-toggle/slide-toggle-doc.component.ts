import { Component } from '@angular/core';

@Component({
  selector: 'doc-slide-toggle',
  templateUrl: './slide-toggle-doc.component.html'
})
export class SlideToggleDocComponent {
  slideToggleDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/slide-toggle-example-default.component.html');
  slideToggleDefaultExampleComponent: string = require('!!raw-loader!./examples/default/slide-toggle-example-default.component.ts');
}
