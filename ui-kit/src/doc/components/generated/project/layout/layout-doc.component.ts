import { Component } from '@angular/core';

@Component({
  selector: 'doc-layout',
  templateUrl: 'layout-doc.component.html'
})
export class LayoutDocComponent {
  layoutBlurMiddleExampleTemplate: string = require('!!raw-loader!./examples/blur-middle/layout-blur-middle-example.component.html');
  layoutBlurMiddleExampleComponent: string = require('!!raw-loader!./examples/blur-middle/layout-blur-middle-example.component.ts');
}
