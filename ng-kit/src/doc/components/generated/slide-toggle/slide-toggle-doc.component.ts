import { Component } from '@angular/core';

@Component({
  selector: 'doc-slide-toggle',
  templateUrl: 'slide-toggle-doc.component.html'
})
export class SlideToggleDocComponent {

  slideToggleDefaultExampleTemplate: string = require('!!raw-loader!./examples/slide-toggle-default-example/slide-toggle-default-example.component.html');
  slideToggleDefaultExampleComponent: string = require('!!raw-loader!./examples/slide-toggle-default-example/slide-toggle-default-example.component.ts');
}
